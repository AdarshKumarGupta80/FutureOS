-- PostgreSQL schema for FutureOS
-- All LONGTEXT → TEXT (PostgreSQL uses TEXT for unlimited strings)
-- All AUTO_INCREMENT → BIGSERIAL
-- Run once on a fresh database; idempotent via IF NOT EXISTS

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  background TEXT,
  resume_url VARCHAR(500),
  github_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  project_zip_url VARCHAR(500),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS goals (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  goal TEXT NOT NULL,
  biggest_confusion TEXT NOT NULL,
  success_definition TEXT NOT NULL,
  weekly_available_hours INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS clarifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  question TEXT NOT NULL,
  assumption TEXT,
  answer TEXT,
  confidence_impact DOUBLE PRECISION DEFAULT 0,
  status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS future_branches (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(160) NOT NULL,
  why_it_fits TEXT,
  risks TEXT,
  tradeoffs TEXT,
  lifestyle_impact TEXT,
  opportunities TEXT,
  skills_required TEXT,
  timeline TEXT,
  score DOUBLE PRECISION DEFAULT 0,
  confidence_score DOUBLE PRECISION DEFAULT 0,
  assumptions_used TEXT,
  one_year_outlook TEXT,
  three_year_outlook TEXT,
  five_year_outlook TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS preferences (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  financial_security INT NOT NULL DEFAULT 5,
  career_growth INT NOT NULL DEFAULT 5,
  autonomy INT NOT NULL DEFAULT 5,
  risk_tolerance INT NOT NULL DEFAULT 5,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS selected_futures (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  future_branch_id BIGINT NOT NULL,
  selected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (future_branch_id) REFERENCES future_branches(id)
);

CREATE TABLE IF NOT EXISTS gap_reports (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  current_state TEXT,
  selected_future TEXT,
  verified_strengths TEXT,
  missing_skills TEXT,
  missing_projects TEXT,
  missing_experience TEXT,
  missing_certifications TEXT,
  evidence_reasoning TEXT,
  confidence_score DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS roadmaps (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(190) NOT NULL,
  weekly_plan TEXT,
  monthly_plan TEXT,
  expected_outcomes TEXT,
  decision_tree TEXT,
  version INT DEFAULT 1,
  adaptation_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS decision_graphs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  roadmap_id BIGINT,
  title VARCHAR(190) NOT NULL,
  nodes_json TEXT NOT NULL,
  edges_json TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
);

CREATE TABLE IF NOT EXISTS roadmap_versions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  roadmap_id BIGINT NOT NULL,
  version INT,
  reason TEXT,
  snapshot_json TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
);

CREATE TABLE IF NOT EXISTS accountability_insights (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  completion_rate DOUBLE PRECISION DEFAULT 0,
  missed_commitments INT DEFAULT 0,
  consistency_score DOUBLE PRECISION DEFAULT 0,
  common_blockers TEXT,
  weekly_insight TEXT,
  accountability_summary TEXT,
  suggested_adjustments TEXT,
  recommended_next_action TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS milestones (
  id BIGSERIAL PRIMARY KEY,
  roadmap_id BIGINT NOT NULL,
  title VARCHAR(190) NOT NULL,
  target_date DATE,
  status VARCHAR(40) NOT NULL DEFAULT 'PLANNED',
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  milestone_id BIGINT,
  user_id BIGINT NOT NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(40) NOT NULL DEFAULT 'TODO',
  commitment BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (milestone_id) REFERENCES milestones(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS life_experiments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(190) NOT NULL,
  hypothesis TEXT,
  duration_days INT NOT NULL DEFAULT 7,
  success_metric TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'PLANNED',
  path_a VARCHAR(255),
  path_b VARCHAR(255),
  day_plan_json TEXT,
  checkins_json TEXT,
  verdict_json TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS progress_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  task_id BIGINT,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  read_flag BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);