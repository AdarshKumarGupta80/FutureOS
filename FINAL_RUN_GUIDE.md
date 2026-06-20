# FutureOS Final Run Guide (RC-1)

## Goal

Start FutureOS on a fresh machine and complete the full workflow using demo credentials.

## Prerequisites

Required:

- Docker Desktop with Docker Compose
- OpenAI API key

Optional manual-development tools:

- Java 24
- IntelliJ IDEA
- MySQL 8
- Node.js 24+
- Python 3.12+

## One-Command Startup

From the repository root:

```powershell
.\start-all.ps1
```

On first run, the script creates `.env` from `.env.example`.

Before running the full AI workflow, edit `.env`:

```env
OPENAI_API_KEY=your_real_openai_api_key
OPENAI_MODEL=gpt-4.1-mini
MYSQL_ROOT_PASSWORD=futureos_root
MYSQL_USER=futureos
MYSQL_PASSWORD=futureos
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
VITE_API_BASE=http://localhost:8080/api
```

Then run:

```powershell
docker compose up --build
```

## Services

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| FastAPI AI Service | `http://localhost:8001` |
| MySQL | `localhost:3306` |

## Demo Account Credentials

Use this account first:

```text
student.ai@futureos.dev
password123
```

Other demo accounts:

```text
student.founder@futureos.dev / password123
switcher@futureos.dev / password123
```

## Full Workflow Test Path

1. Open `http://localhost:5173`.
2. Select `AI Student`.
3. Log in.
4. Open Dashboard and confirm:
   - Goal Summary appears
   - Selected Future appears
   - Roadmap Progress appears
   - AI Insights appear
5. Open Onboarding.
6. Submit onboarding data.
7. Open Futures.
8. Answer a clarification card.
9. Move preference sliders.
10. Click `Save`.
11. Select a future branch.
12. Open Gap Analysis.
13. Click `Generate Gap Report`.
14. Open Roadmap.
15. Click `Generate Roadmap`.
16. Use graph zoom/collapse/highlight controls.
17. Open Progress.
18. Mark one task done.
19. Add a progress log.
20. Open Accountability.
21. Submit an accountability note.
22. Return to Dashboard and confirm updated insight/progress.

## Manual Startup Alternative

Use this if not using Docker.

### MySQL

```sql
CREATE DATABASE IF NOT EXISTS futureos;
```

### AI Service

```powershell
cd ai-service
python -m pip install -r requirements.txt
$env:OPENAI_API_KEY="your_real_openai_api_key"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### Backend

Open `backend` in IntelliJ as a Maven project.

Set environment variables:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/futureos?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="replace-with-a-long-random-secret-at-least-32-characters"
$env:AI_BASE_URL="http://localhost:8001"
```

Run:

```text
FutureOsApplication
```

### Frontend

```powershell
cd frontend
npm install
$env:VITE_API_BASE="http://localhost:8080/api"
npm run dev
```

## Troubleshooting

### AI endpoints return 503

`OPENAI_API_KEY` is missing. Add it to `.env` or your shell environment and restart the AI service.

### Backend cannot connect to MySQL

Check:

- MySQL is running
- Database `futureos` exists
- `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` are correct

### Unknown column `created_at`

Your local database is stale from an older FutureOS schema. Run:

```powershell
mysql -u root -p futureos < database\repair_existing_db.sql
```

Or execute `database/repair_existing_db.sql` in MySQL Workbench.

### Login fails

Check:

- Backend is running on `8080`
- MySQL is connected
- Demo seed data loaded
- Use `student.ai@futureos.dev` / `password123`

### Frontend shows API errors

Check:

- `VITE_API_BASE=http://localhost:8080/api`
- Backend CORS allows frontend origin
- JWT token exists after login

### Docker build fails on backend

Confirm Docker can pull:

- `maven:3.9.11-eclipse-temurin-24`
- `eclipse-temurin:24-jre`

If your Docker registry does not have those tags, use IntelliJ manual startup.
