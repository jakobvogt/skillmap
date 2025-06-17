-- Add working hours per week to employees table
ALTER TABLE employees 
ADD COLUMN working_hours_per_week INTEGER NOT NULL DEFAULT 40;

-- Add FTE fields to project_skills table
ALTER TABLE project_skills 
ADD COLUMN minimum_fte DOUBLE PRECISION NOT NULL DEFAULT 1.0,
ADD COLUMN fte_threshold DOUBLE PRECISION NOT NULL DEFAULT 0.4;

-- Migrate existing number_of_people_required to minimum_fte
-- Simple 1:1 conversion (1 person = 1 FTE)
UPDATE project_skills 
SET minimum_fte = number_of_people_required * 1.0;

-- Drop the old column
ALTER TABLE project_skills 
DROP COLUMN number_of_people_required;

-- Add comment for clarity
COMMENT ON COLUMN employees.working_hours_per_week IS 'Standard working hours per week for this employee (default 40 for full-time)';
COMMENT ON COLUMN project_skills.minimum_fte IS 'Minimum total FTE required for this skill on the project';
COMMENT ON COLUMN project_skills.fte_threshold IS 'Minimum FTE per individual assignment to be considered effective';