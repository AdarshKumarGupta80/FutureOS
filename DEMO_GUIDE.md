# FutureOS Demo Guide

## Recommended Demo Account

Use:

```text
student.ai@futureos.dev
password123
```

Other demo accounts:

- `student.founder@futureos.dev` / `password123`
- `switcher@futureos.dev` / `password123`

## Best 3-5 Minute Demo Flow

### 1. Login

Open:

```text
http://localhost:5173
```

Click the `AI Student` demo selector, then log in.

Expected output:

- Dashboard opens.
- Goal Summary card is populated.
- Selected Future card shows AI Engineer.
- Roadmap Progress and AI Insights are visible.

### 2. Dashboard

Show:

- Goal Summary Card
- Selected Future Card
- Roadmap Progress
- Accountability Score
- AI Insights Panel
- Next Recommended Action

Talking point:

FutureOS is not a chatbot. It turns AI reasoning into dashboards, future branches, roadmaps, and accountability systems.

### 3. Future Simulation

Go to:

```text
Futures
```

Show:

- Assumption validation cards
- Preference sliders
- Future branch cards
- Future comparison table

Expected output:

- Each branch shows match score, confidence score, opportunities, risks, tradeoffs, lifestyle impact, skills, and timeline.

### 4. Gap Analysis

Go to:

```text
Gap Analysis
```

Click `Generate Gap Report` if needed.

Show:

- Verified strengths
- Missing skills
- Missing projects
- Evidence reasoning
- Confidence score

### 5. Roadmap

Go to:

```text
Roadmap
```

Show:

- Visual Decision Compiler graph
- Zoom controls
- Collapse/expand
- Roadmap progress
- Weekly objectives
- Milestone timeline
- Life experiments

### 6. Action Tracking

Go to:

```text
Progress
```

Mark one task done.

Expected output:

- Completion percentage updates after dashboard reload.
- Roadmap can adapt through backend logic.

### 7. Accountability

Go to:

```text
Accountability
```

Enter:

```text
I completed the first proof slice but got stuck collecting feedback.
```

Click `Update Roadmap Signal`.

Expected output:

- Accountability response appears.
- Insights update on the dashboard.

## Screens To Show Judges

1. Dashboard
2. Futures
3. Gap Analysis
4. Roadmap
5. Accountability

## Demo Safety Notes

- Start all services before demo.
- Ensure `OPENAI_API_KEY` is configured.
- Use seeded demo accounts to avoid empty screens.
- If OpenAI is unavailable, explain that FutureOS intentionally fails visibly instead of hallucinating mock AI results.

