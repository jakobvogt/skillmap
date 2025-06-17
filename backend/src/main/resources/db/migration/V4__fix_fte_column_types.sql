-- Fix column types for FTE fields to use DOUBLE PRECISION instead of DECIMAL
ALTER TABLE project_skills 
ALTER COLUMN minimum_fte TYPE DOUBLE PRECISION,
ALTER COLUMN fte_threshold TYPE DOUBLE PRECISION;