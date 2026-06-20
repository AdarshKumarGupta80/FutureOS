# FutureOS Submission Test Checklist

## Frontend

- [ ] `npm install` completed.
- [ ] `npm run build` passes.
- [ ] `npm run dev` starts at `http://localhost:5173`.
- [ ] Login screen loads.
- [ ] Dashboard loads after login.
- [ ] All routes open without blank screens:
  - [ ] Dashboard
  - [ ] Onboarding
  - [ ] Futures
  - [ ] Gap Analysis
  - [ ] Roadmap
  - [ ] Progress
  - [ ] Accountability
  - [ ] Settings
- [ ] Mobile width layout is usable.

## Backend

- [ ] IntelliJ imports `backend/pom.xml`.
- [ ] Java SDK is set to Java 24.
- [ ] Spring Boot starts on port `8080`.
- [ ] `/api/auth/login` returns JWT for demo account.
- [ ] Protected `/api/dashboard` rejects requests without JWT.
- [ ] Protected `/api/dashboard` works with JWT.

## MySQL

- [ ] MySQL 8 is running.
- [ ] Database `futureos` exists.
- [ ] JPA creates/updates all tables.
- [ ] Demo users are seeded.
- [ ] Foreign keys are present.

## FastAPI

- [ ] `python -m pip install -r requirements.txt` completed.
- [ ] `OPENAI_API_KEY` is configured.
- [ ] FastAPI starts on port `8001`.
- [ ] `/health` returns `{"status":"ok"}`.

## OpenAI

- [ ] `/ai/future-simulation` returns structured JSON.
- [ ] `/ai/gap-analysis` returns structured JSON.
- [ ] `/ai/roadmap` returns structured JSON with graph.
- [ ] `/ai/accountability` returns structured JSON.
- [ ] Missing `OPENAI_API_KEY` returns clear `503` error.

## Demo Accounts

- [ ] `student.ai@futureos.dev` / `password123`
- [ ] `student.founder@futureos.dev` / `password123`
- [ ] `switcher@futureos.dev` / `password123`

## Workflow

- [ ] Login
- [ ] Onboarding submit
- [ ] Clarification answer
- [ ] Future simulation
- [ ] Preference slider save
- [ ] Future selection
- [ ] Gap report generation
- [ ] Roadmap generation
- [ ] Task completion
- [ ] Progress log
- [ ] Accountability check-in
- [ ] Dashboard updates

