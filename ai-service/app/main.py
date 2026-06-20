import json
import os
from pathlib import Path
from typing import Any

# Load .env automatically so the service works when run manually with uvicorn
# (Docker Compose injects env vars directly; this is a no-op in that case).
# Searches: ai-service/.env  →  project-root/.env  →  already-set env vars win.
try:
    from dotenv import load_dotenv
    _here = Path(__file__).resolve().parent.parent          # ai-service/
    _root = _here.parent                                     # project root
    load_dotenv(_here / ".env", override=False)
    load_dotenv(_root / ".env", override=False)
except ImportError:
    pass  # python-dotenv not installed — rely on env vars being set externally

from fastapi import FastAPI, HTTPException, Request
from openai import OpenAI
from pydantic import BaseModel, field_validator
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

app = FastAPI(title="FutureOS AI Service")


# ---------------------------------------------------------------------------
# ASGI-level logging middleware — avoids the BaseHTTPMiddleware body-drain bug.
#
# Root cause of the original empty-body bug:
#   The previous implementation used @app.middleware("http") which is built on
#   Starlette's BaseHTTPMiddleware.  That middleware reads the body via
#   `await request.body()`, which consumes the underlying ASGI receive stream.
#   The patch `request._receive = receive` only replaces the attribute on the
#   *current* Request object; however, `call_next()` internally creates a brand-
#   new Request from the original ASGI scope + the *original* (now exhausted)
#   receive callable, so the downstream endpoint always saw 0 bytes.
#
# Fix: implement a raw ASGI middleware that wraps the receive callable at the
#   scope level before the body is ever consumed, ensuring every reader —
#   including the one inside call_next / the endpoint — gets the full body.
# ---------------------------------------------------------------------------
class RequestLoggingMiddleware:
    """Pure ASGI middleware that logs request bodies without consuming them."""

    def __init__(self, asgi_app: ASGIApp) -> None:
        self.app = asgi_app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        if not path.startswith("/ai/"):
            await self.app(scope, receive, send)
            return

        # Buffer the entire body by draining the receive stream once.
        body_chunks: list[bytes] = []
        more_body = True
        while more_body:
            message = await receive()
            body_chunks.append(message.get("body", b""))
            more_body = message.get("more_body", False)

        full_body = b"".join(body_chunks)

        method = scope.get("method", "?")
        headers = dict(scope.get("headers", []))
        content_type = headers.get(b"content-type", b"MISSING").decode("utf-8", errors="replace")

        print(f"[FutureOS FastAPI] ← {method} {path}", flush=True)
        print(f"[FutureOS FastAPI]   Content-Type: {content_type}", flush=True)
        print(
            f"[FutureOS FastAPI]   body ({len(full_body)} bytes): "
            f"{full_body.decode('utf-8', errors='replace')[:800]}",
            flush=True,
        )
        if len(full_body) == 0:
            print("[FutureOS FastAPI]   ⚠️  EMPTY BODY", flush=True)

        # Re-inject the buffered body so downstream readers see the full payload.
        body_sent = False

        async def replay_receive() -> dict:
            nonlocal body_sent
            if not body_sent:
                body_sent = True
                return {"type": "http.request", "body": full_body, "more_body": False}
            # Subsequent reads (e.g. disconnect) block forever — return disconnect.
            return {"type": "http.disconnect"}

        await self.app(scope, replay_receive, send)


app.add_middleware(RequestLoggingMiddleware)


# ---------------------------------------------------------------------------
# Pydantic request models
# ---------------------------------------------------------------------------

class FutureSimulationRequest(BaseModel):
    goal: str | None = None
    biggestConfusion: str | None = None
    successDefinition: str | None = None
    weeklyAvailableHours: int | None = None
    background: str | None = None
    resumeUrl: str | None = None
    githubUrl: str | None = None
    portfolioUrl: str | None = None
    projectZipUrl: str | None = None
    preferences: dict[str, Any] | None = None
    clarifications: list[dict[str, Any]] | None = None

    @field_validator("resumeUrl", "githubUrl", "portfolioUrl", "projectZipUrl", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: Any) -> Any:
        return None if v == "" else v


class GapRequest(BaseModel):
    background: str
    future: str
    resumeUrl: str | None = None
    githubUrl: str | None = None
    portfolioUrl: str | None = None
    projectZipUrl: str | None = None

    @field_validator("resumeUrl", "githubUrl", "portfolioUrl", "projectZipUrl", mode="before")
    @classmethod
    def empty_str_to_none(cls, v: Any) -> Any:
        return None if v == "" else v


class RoadmapRequest(BaseModel):
    future: str
    gap: str


class AccountabilityRequest(BaseModel):
    completionRate: float = 0
    missedCommitments: int = 0
    accountabilityNote: str = ""
    recentLogs: list[str] = []


# ---------------------------------------------------------------------------
# AI client factory
# ---------------------------------------------------------------------------

def get_ai_client() -> tuple[OpenAI, str]:
    """
    Returns (OpenAI-compatible client, model_name).
    Prefers Groq if GROQ_API_KEY is set, falls back to OpenAI.
    """
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    if groq_key:
        model = os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
        print(f"[FutureOS FastAPI] Using Groq — model: {model}", flush=True)
        client = OpenAI(
            api_key=groq_key,
            base_url="https://api.groq.com/openai/v1",
        )
        return client, model

    if openai_key:
        model = os.getenv("AI_MODEL", os.getenv("OPENAI_MODEL", "gpt-4.1-mini"))
        print(f"[FutureOS FastAPI] Using OpenAI — model: {model}", flush=True)
        return OpenAI(api_key=openai_key), model

    raise HTTPException(
        status_code=503,
        detail=(
            "No AI API key configured. "
            "Set GROQ_API_KEY (recommended) or OPENAI_API_KEY in your .env file."
        ),
    )


def openai_json(system: str, payload: dict[str, Any]) -> dict[str, Any]:
    client, model = get_ai_client()
    try:
        print(f"[FutureOS FastAPI]   → sending to model {model}, keys: {list(payload.keys())}", flush=True)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": json.dumps(payload, ensure_ascii=True)},
            ],
            response_format={"type": "json_object"},
            temperature=0.35,
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("AI model returned an empty response.")
        result = json.loads(content)
        print(f"[FutureOS FastAPI]   ← response keys: {list(result.keys())}", flush=True)
        return result
    except HTTPException:
        raise
    except Exception as exc:
        print(f"[FutureOS FastAPI]   ✗ AI error: {exc}", flush=True)
        raise HTTPException(status_code=502, detail=f"AI request failed: {exc}") from exc


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ai/future-simulation")
def future_simulation(request: FutureSimulationRequest) -> dict[str, Any]:
    print(
        f"[FutureOS FastAPI]   Parsed: goal={request.goal!r} hours={request.weeklyAvailableHours}",
        flush=True,
    )
    system = (
        "You are the FutureOS Advanced Future Simulation and Assumption Validation Engine. "
        "FutureOS is not a chatbot. Generate background intelligence for dashboards, cards, "
        "roadmaps, and timelines. Use only provided evidence: profile, goal, confusion, "
        "success definition, weekly hours, preference sliders, clarification answers, and "
        "evidence links. Never make hidden assumptions. If information is missing or "
        "conflicting, create clarification cards. Return valid JSON only with this exact shape: "
        "{"
        '"clarifications":[{"assumption":"...","question":"...","confidenceImpact":number}],'
        '"futures":[{"title":"...","score":number,"confidenceScore":number,"whyItFits":"...",'
        '"opportunities":"...","risks":"...","tradeoffs":"...","lifestyleImpact":"...",'
        '"skillsRequired":"...","timeline":"...","assumptionsUsed":"...","oneYearOutlook":"...",'
        '"threeYearOutlook":"...","fiveYearOutlook":"..."}]'
        "}. Generate 3 to 5 future branches. Scores must be 0-100. "
        "Confidence must be lower when evidence is weak."
    )
    return openai_json(system, request.model_dump(exclude_none=True))


@app.post("/ai/onboard")
def onboard(request: FutureSimulationRequest) -> dict[str, Any]:
    return future_simulation(request)


@app.post("/ai/gap-analysis")
def gap_analysis(request: GapRequest) -> dict[str, Any]:
    system = (
        "You are the FutureOS Evidence-Based Gap Analysis Engine. Do not rely only on "
        "self-report. Use background plus resumeUrl, githubUrl, portfolioUrl, and "
        "projectZipUrl as evidence signals when present. If evidence links are missing, "
        "explicitly lower confidence and explain why. Return valid JSON only with this exact "
        "shape: "
        "{"
        '"currentState":"...","selectedFuture":"...","verifiedStrengths":"...","missingSkills":"...",'
        '"missingProjects":"...","missingExperience":"...","missingCertifications":"...",'
        '"evidenceReasoning":"...","confidenceScore":number'
        "}. Every gap must include compact reasoning tied to evidence or missing evidence."
    )
    return openai_json(system, request.model_dump(exclude_none=True))


@app.post("/ai/roadmap")
def roadmap(request: RoadmapRequest) -> dict[str, Any]:
    system = (
        "You are the FutureOS Decision Compiler and Adaptive Roadmap Generator. "
        "Convert the selected future and gap analysis into dependency graph data and "
        "execution plans. Return valid JSON only with this exact shape: "
        "{"
        '"title":"...","decisionTree":"...",'
        '"graph":{"nodes":[{"id":"...","label":"...","type":"future|skill|proof|milestone|outcome"}],'
        '"edges":[{"from":"...","to":"..."}]},'
        '"weeklyPlan":"...","monthlyPlan":"...","expectedOutcomes":"...",'
        '"milestones":["..."],"tasks":["..."],'
        '"experiments":[{"title":"...","hypothesis":"...","durationDays":number,"successMetric":"..."}]'
        "}. The dependency graph must be acyclic and must show prerequisites from foundation to outcome."
    )
    return openai_json(system, request.model_dump())


@app.post("/ai/accountability")
def accountability(request: AccountabilityRequest) -> dict[str, Any]:
    system = (
        "You are the FutureOS Accountability Intelligence Engine. "
        "Analyze completion rate, missed commitments, recent progress logs, and the user's "
        "accountability note. Return valid JSON only with this exact shape: "
        "{"
        '"commonBlockers":"...","weeklyInsight":"...","accountabilitySummary":"...",'
        '"suggestedAdjustments":"...","recommendedNextAction":"..."'
        "}. Keep it direct, practical, and suitable for dashboard cards."
    )
    return openai_json(system, request.model_dump())
