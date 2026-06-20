USE futureos;

DROP PROCEDURE IF EXISTS add_column_if_missing;

DELIMITER $$

CREATE PROCEDURE add_column_if_missing(
  IN target_table VARCHAR(64),
  IN target_column VARCHAR(64),
  IN column_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = target_table
      AND COLUMN_NAME = target_column
  ) THEN
    SET @repair_sql = CONCAT(
      'ALTER TABLE `',
      target_table,
      '` ADD COLUMN `',
      target_column,
      '` ',
      column_definition
    );
    PREPARE repair_stmt FROM @repair_sql;
    EXECUTE repair_stmt;
    DEALLOCATE PREPARE repair_stmt;
  END IF;
END$$

DELIMITER ;

CALL add_column_if_missing('users', 'created_at', 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP');

CALL add_column_if_missing('clarifications', 'assumption', 'TEXT');
CALL add_column_if_missing('clarifications', 'confidence_impact', 'DOUBLE DEFAULT 0');

CALL add_column_if_missing('future_branches', 'tradeoffs', 'TEXT');
CALL add_column_if_missing('future_branches', 'lifestyle_impact', 'TEXT');
CALL add_column_if_missing('future_branches', 'confidence_score', 'DOUBLE DEFAULT 0');
CALL add_column_if_missing('future_branches', 'assumptions_used', 'TEXT');
CALL add_column_if_missing('future_branches', 'one_year_outlook', 'TEXT');
CALL add_column_if_missing('future_branches', 'three_year_outlook', 'TEXT');
CALL add_column_if_missing('future_branches', 'five_year_outlook', 'TEXT');

CALL add_column_if_missing('gap_reports', 'verified_strengths', 'TEXT');
CALL add_column_if_missing('gap_reports', 'evidence_reasoning', 'TEXT');
CALL add_column_if_missing('gap_reports', 'confidence_score', 'DOUBLE DEFAULT 0');

CALL add_column_if_missing('roadmaps', 'version', 'INT DEFAULT 1');
CALL add_column_if_missing('roadmaps', 'adaptation_reason', 'TEXT');

CREATE TABLE IF NOT EXISTS decision_graphs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  roadmap_id BIGINT,
  title VARCHAR(190) NOT NULL,
  nodes_json LONGTEXT NOT NULL,
  edges_json LONGTEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
);

CREATE TABLE IF NOT EXISTS roadmap_versions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  roadmap_id BIGINT NOT NULL,
  version INT,
  reason TEXT,
  snapshot_json LONGTEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
);

CREATE TABLE IF NOT EXISTS accountability_insights (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  completion_rate DOUBLE DEFAULT 0,
  missed_commitments INT DEFAULT 0,
  consistency_score DOUBLE DEFAULT 0,
  common_blockers TEXT,
  weekly_insight TEXT,
  accountability_summary TEXT,
  suggested_adjustments TEXT,
  recommended_next_action TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

DROP PROCEDURE IF EXISTS add_column_if_missing;
