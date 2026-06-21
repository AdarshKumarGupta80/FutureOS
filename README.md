# FutureOS

**Design Your Future Before You Live It**

FutureOS is a full-stack MVP for AI-assisted decision intelligence. The app guides users from onboarding through assumption validation, future simulation, gap analysis, roadmap generation, life experiments, action tracking, and accountability.

## Stack

- Frontend: React, Vite, TypeScript, TailwindCSS, React Router
- Backend: Java 24, Spring Boot 3, Spring Security, JWT, Spring Data JPA
- Database: MySQL 8
- AI service: FastAPI, OpenAI API compatible client

## Local Setup

1. Start MySQL and create the database:

```sql
CREATE DATABASE futureos;
```

2. Configure environment variables:

```powershell
$env:JWT_SECRET="change-this-to-a-long-random-secret"
$env:OPENAI_API_KEY="your-openai-key"
```

3. Run the AI service:

```powershell
.\scripts\run-ai.ps1
```

4. Run the backend. This script installs Maven into `.tools/` if `mvn` is not available globally:

```powershell
.\scripts\run-backend.ps1
```

5. Run the frontend:

```powershell
.\scripts\run-frontend.ps1
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:8080`, and AI service at `http://localhost:8001`.

## Verification

```powershell
.\scripts\verify-frontend.ps1
.\scripts\verify-backend.ps1
python -m py_compile ai-service\app\main.py
```

## Existing Database Repair

If Spring Boot fails with an error like:

```text
Unknown column 'created_at' in 'field list'
```

your local MySQL database was created from an older schema. Run:

```powershell
mysql -u root -p futureos < database\repair_existing_db.sql
```

Or open MySQL Workbench, select the `futureos` database, and execute `database/repair_existing_db.sql`.

## Default Flow

Register or log in, complete onboarding, review clarification cards, simulate futures, tune preferences, select a future, generate gap analysis, compile the decision tree, generate a roadmap, run experiments, track tasks, and answer accountability prompts on return.

## Demo Accounts

When the backend starts, it seeds realistic demo users if they do not already exist:

- `ankit@gmail.com` / `1234567890`


## Live Link Of Project
https://futureos-frontend.onrender.com/
