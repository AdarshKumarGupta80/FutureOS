# FutureOS Deployment Guide

## Prerequisites

- Java 24
- IntelliJ IDEA with Maven support
- Node.js 24+
- Python 3.12+ recommended
- MySQL 8
- OpenAI API key

## Environment Variables

Backend:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/futureos?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:JWT_SECRET="replace-with-a-long-random-production-secret"
$env:AI_BASE_URL="http://localhost:8001"
```

FastAPI AI service:

```powershell
$env:OPENAI_API_KEY="your_openai_api_key"
$env:OPENAI_MODEL="gpt-4.1-mini"
```

Frontend:

```powershell
$env:VITE_API_BASE="http://localhost:8080/api"
```

## MySQL Setup

Start MySQL 8, then create the database:

```sql
CREATE DATABASE IF NOT EXISTS futureos;
```

Spring Boot uses `ddl-auto: update`, so tables are created/updated automatically from JPA entities. The SQL schema is also available at `database/schema.sql`.

## FastAPI Startup

```powershell
cd ai-service
python -m pip install -r requirements.txt
$env:OPENAI_API_KEY="your_openai_api_key"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Health check:

```powershell
curl http://localhost:8001/health
```

Expected:

```json
{"status":"ok"}
```

## Backend Startup

Open the `backend` folder in IntelliJ as a Maven project.

1. Let IntelliJ import `pom.xml`.
2. Ensure Java SDK is set to Java 24.
3. Configure backend environment variables.
4. Run `FutureOsApplication`.

Backend URL:

```text
http://localhost:8080
```

Auth endpoint smoke test:

```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"student.ai@futureos.dev\",\"password\":\"password123\"}"
```

## Frontend Startup

```powershell
cd frontend
npm install
$env:VITE_API_BASE="http://localhost:8080/api"
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## OpenAI Configuration

FutureOS AI modules require `OPENAI_API_KEY`.

If the key is missing, FastAPI returns `503` intentionally. The app does not use mock AI fallbacks for production AI modules.

AI modules:

- Future Simulation: `/ai/future-simulation`
- Assumption Validation: generated inside future simulation
- Gap Analysis: `/ai/gap-analysis`
- Decision Compiler and Roadmap: `/ai/roadmap`
- Accountability Engine: `/ai/accountability`

## Startup Order

1. MySQL
2. FastAPI AI service
3. Spring Boot backend
4. React frontend

