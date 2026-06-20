-- FutureOS: Fix column types truncated by ddl-auto:update
-- Run this ONCE against your futureos MySQL database.
-- Problem: Hibernate ddl-auto:update never changes existing column types.
-- These columns were created as VARCHAR(255) before @Lob was added to the models.
-- This script converts them all to LONGTEXT so AI-generated JSON/text fits.

USE futureos;

-- decision_graphs: nodes_json and edges_json (root cause of current 500 error)
ALTER TABLE decision_graphs
  MODIFY COLUMN nodes_json LONGTEXT NOT NULL,
  MODIFY COLUMN edges_json LONGTEXT NOT NULL;

-- future_branches: all AI-generated text fields
ALTER TABLE future_branches
  MODIFY COLUMN why_it_fits     LONGTEXT,
  MODIFY COLUMN risks           LONGTEXT,
  MODIFY COLUMN tradeoffs       LONGTEXT,
  MODIFY COLUMN lifestyle_impact LONGTEXT,
  MODIFY COLUMN opportunities   LONGTEXT,
  MODIFY COLUMN skills_required LONGTEXT,
  MODIFY COLUMN timeline        LONGTEXT,
  MODIFY COLUMN assumptions_used LONGTEXT,
  MODIFY COLUMN one_year_outlook  LONGTEXT,
  MODIFY COLUMN three_year_outlook LONGTEXT,
  MODIFY COLUMN five_year_outlook  LONGTEXT;

-- gap_reports
ALTER TABLE gap_reports
  MODIFY COLUMN current_state          LONGTEXT,
  MODIFY COLUMN selected_future        LONGTEXT,
  MODIFY COLUMN verified_strengths     LONGTEXT,
  MODIFY COLUMN missing_skills         LONGTEXT,
  MODIFY COLUMN missing_projects       LONGTEXT,
  MODIFY COLUMN missing_experience     LONGTEXT,
  MODIFY COLUMN missing_certifications LONGTEXT,
  MODIFY COLUMN evidence_reasoning     LONGTEXT;

-- roadmaps
ALTER TABLE roadmaps
  MODIFY COLUMN weekly_plan      LONGTEXT,
  MODIFY COLUMN monthly_plan     LONGTEXT,
  MODIFY COLUMN expected_outcomes LONGTEXT,
  MODIFY COLUMN decision_tree    LONGTEXT,
  MODIFY COLUMN adaptation_reason LONGTEXT;

-- roadmap_versions
ALTER TABLE roadmap_versions
  MODIFY COLUMN reason        LONGTEXT,
  MODIFY COLUMN snapshot_json LONGTEXT;

-- accountability_insights
ALTER TABLE accountability_insights
  MODIFY COLUMN common_blockers        LONGTEXT,
  MODIFY COLUMN weekly_insight         LONGTEXT,
  MODIFY COLUMN accountability_summary LONGTEXT,
  MODIFY COLUMN suggested_adjustments  LONGTEXT,
  MODIFY COLUMN recommended_next_action LONGTEXT;

-- clarifications
ALTER TABLE clarifications
  MODIFY COLUMN question   LONGTEXT NOT NULL,
  MODIFY COLUMN assumption LONGTEXT,
  MODIFY COLUMN answer     LONGTEXT;

-- goals
ALTER TABLE goals
  MODIFY COLUMN goal              LONGTEXT NOT NULL,
  MODIFY COLUMN biggest_confusion LONGTEXT NOT NULL,
  MODIFY COLUMN success_definition LONGTEXT NOT NULL;

-- life_experiments
ALTER TABLE life_experiments
  MODIFY COLUMN hypothesis     LONGTEXT,
  MODIFY COLUMN success_metric LONGTEXT;

-- progress_logs
ALTER TABLE progress_logs
  MODIFY COLUMN note LONGTEXT NOT NULL;

-- task_items
ALTER TABLE task_items
  MODIFY COLUMN description LONGTEXT;

-- profiles
ALTER TABLE profiles
  MODIFY COLUMN background LONGTEXT;

-- notifications
ALTER TABLE notifications
  MODIFY COLUMN message LONGTEXT NOT NULL;

SELECT 'All columns fixed successfully.' AS result;