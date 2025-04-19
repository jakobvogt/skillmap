-- Create skills table
CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create employees table
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    position VARCHAR(255),
    department VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(19, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create employee_skills table
CREATE TABLE employee_skills (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    proficiency_level INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT employee_skill_unique UNIQUE (employee_id, skill_id)
);

-- Create project_skills table
CREATE TABLE project_skills (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    importance INTEGER NOT NULL,
    minimum_proficiency_required INTEGER,
    number_of_people_required INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT project_skill_unique UNIQUE (project_id, skill_id)
);

-- Create project_assignments table
CREATE TABLE project_assignments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id),
    employee_id BIGINT NOT NULL REFERENCES employees(id),
    role VARCHAR(255),
    allocation_percentage INTEGER NOT NULL DEFAULT 100,
    start_date DATE,
    end_date DATE,
    is_automatically_assigned BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT project_employee_unique UNIQUE (project_id, employee_id)
);

-- Create indexes for foreign keys for better performance
CREATE INDEX idx_employee_skills_employee_id ON employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill_id ON employee_skills(skill_id);
CREATE INDEX idx_project_skills_project_id ON project_skills(project_id);
CREATE INDEX idx_project_skills_skill_id ON project_skills(skill_id);
CREATE INDEX idx_project_assignments_project_id ON project_assignments(project_id);
CREATE INDEX idx_project_assignments_employee_id ON project_assignments(employee_id);

-- Create indexes for commonly queried fields
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_name ON employees(first_name, last_name);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);