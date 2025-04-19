-- Insert Skills
INSERT INTO skills (name, category, description, created_at, updated_at) VALUES
-- Frontend Skills
('React', 'Frontend', 'A JavaScript library for building user interfaces', NOW(), NOW()),
('Angular', 'Frontend', 'A platform for building mobile and desktop web applications', NOW(), NOW()),
('Vue.js', 'Frontend', 'A progressive framework for building user interfaces', NOW(), NOW()),
('TypeScript', 'Frontend', 'A typed superset of JavaScript that compiles to plain JavaScript', NOW(), NOW()),
('HTML/CSS', 'Frontend', 'Markup and styling languages for web pages', NOW(), NOW()),

-- Backend Skills
('Spring Boot', 'Backend', 'An extension of the Spring framework that simplifies the initial setup', NOW(), NOW()),
('Kotlin', 'Backend', 'A modern programming language for the JVM', NOW(), NOW()),
('Java', 'Backend', 'A class-based, object-oriented programming language', NOW(), NOW()),
('Node.js', 'Backend', 'A JavaScript runtime built on Chrome''s V8 JavaScript engine', NOW(), NOW()),
('Python', 'Backend', 'An interpreted, high-level programming language', NOW(), NOW()),

-- Database Skills
('PostgreSQL', 'Database', 'An open-source relational database system', NOW(), NOW()),
('MongoDB', 'Database', 'A document-oriented NoSQL database', NOW(), NOW()),
('SQL', 'Database', 'A domain-specific language for managing data in relational databases', NOW(), NOW()),

-- DevOps Skills
('Docker', 'DevOps', 'A platform for developing, shipping, and running applications in containers', NOW(), NOW()),
('Kubernetes', 'DevOps', 'An open-source system for automating deployment, scaling, and management of containerized applications', NOW(), NOW()),
('AWS', 'DevOps', 'Amazon Web Services cloud platform', NOW(), NOW()),
('Git', 'DevOps', 'A distributed version control system', NOW(), NOW());

-- Insert Employees
INSERT INTO employees (first_name, last_name, email, position, department, created_at, updated_at) VALUES
('John', 'Doe', 'john.doe@skillmap.dev', 'Senior Developer', 'Engineering', NOW(), NOW()),
('Jane', 'Smith', 'jane.smith@skillmap.dev', 'Frontend Developer', 'Engineering', NOW(), NOW()),
('Bob', 'Johnson', 'bob.johnson@skillmap.dev', 'Backend Developer', 'Engineering', NOW(), NOW()),
('Alice', 'Williams', 'alice.williams@skillmap.dev', 'Full Stack Developer', 'Engineering', NOW(), NOW()),
('Michael', 'Brown', 'michael.brown@skillmap.dev', 'DevOps Engineer', 'Operations', NOW(), NOW()),
('Emily', 'Davis', 'emily.davis@skillmap.dev', 'Database Administrator', 'Engineering', NOW(), NOW()),
('David', 'Miller', 'david.miller@skillmap.dev', 'Project Manager', 'Management', NOW(), NOW()),
('Sarah', 'Wilson', 'sarah.wilson@skillmap.dev', 'UI/UX Designer', 'Design', NOW(), NOW()),
('James', 'Taylor', 'james.taylor@skillmap.dev', 'Senior Frontend Developer', 'Engineering', NOW(), NOW()),
('Emma', 'Anderson', 'emma.anderson@skillmap.dev', 'Backend Developer', 'Engineering', NOW(), NOW());

-- Insert Projects
INSERT INTO projects (name, description, start_date, end_date, budget, status, created_at, updated_at) VALUES
('E-commerce Platform', 'Development of a new e-commerce platform with modern architecture', '2025-05-01', '2025-10-31', 250000.00, 'PLANNED', NOW(), NOW()),
('Mobile Banking App', 'Secure mobile banking application with biometric authentication', '2025-04-15', '2025-09-30', 180000.00, 'IN_PROGRESS', NOW(), NOW()),
('Customer Portal Redesign', 'Redesign of the existing customer portal with improved UX', '2025-03-01', '2025-06-30', 120000.00, 'IN_PROGRESS', NOW(), NOW()),
('Data Warehouse Migration', 'Migration of legacy data warehouse to cloud-based solution', '2025-01-15', '2025-04-15', 200000.00, 'COMPLETED', NOW(), NOW()),
('Internal HR System', 'Development of a new HR system for employee management', '2025-06-01', '2025-12-31', 150000.00, 'PLANNED', NOW(), NOW()),
('DevOps Toolchain Upgrade', 'Upgrading and standardizing DevOps tools across the organization', '2025-02-01', '2025-05-31', 90000.00, 'IN_PROGRESS', NOW(), NOW());

-- Insert Employee Skills
-- John Doe (Senior Developer)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(1, 7, 5, 'Expert in Kotlin development', NOW(), NOW()),  -- Kotlin
(1, 6, 4, 'Extensive experience with Spring Boot', NOW(), NOW()),  -- Spring Boot
(1, 11, 4, 'Proficient in PostgreSQL', NOW(), NOW()),  -- PostgreSQL
(1, 1, 3, 'Good knowledge of React', NOW(), NOW()),  -- React
(1, 17, 5, 'Expert in Git workflow and best practices', NOW(), NOW());  -- Git

-- Jane Smith (Frontend Developer)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(2, 1, 5, 'Expert in React development', NOW(), NOW()),  -- React
(2, 4, 5, 'Advanced TypeScript knowledge', NOW(), NOW()),  -- TypeScript
(2, 5, 5, 'Expert in HTML/CSS', NOW(), NOW()),  -- HTML/CSS
(2, 3, 3, 'Working knowledge of Vue.js', NOW(), NOW()),  -- Vue.js
(2, 17, 4, 'Proficient with Git', NOW(), NOW());  -- Git

-- Bob Johnson (Backend Developer)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(3, 8, 5, 'Expert in Java development', NOW(), NOW()),  -- Java
(3, 6, 5, 'Expert in Spring Boot', NOW(), NOW()),  -- Spring Boot
(3, 11, 4, 'Proficient in PostgreSQL', NOW(), NOW()),  -- PostgreSQL
(3, 13, 5, 'Expert in SQL', NOW(), NOW()),  -- SQL
(3, 14, 3, 'Working knowledge of Docker', NOW(), NOW());  -- Docker

-- Alice Williams (Full Stack Developer)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(4, 1, 4, 'Proficient in React', NOW(), NOW()),  -- React
(4, 4, 4, 'Proficient in TypeScript', NOW(), NOW()),  -- TypeScript
(4, 7, 4, 'Proficient in Kotlin', NOW(), NOW()),  -- Kotlin
(4, 6, 4, 'Proficient in Spring Boot', NOW(), NOW()),  -- Spring Boot
(4, 11, 3, 'Good knowledge of PostgreSQL', NOW(), NOW()),  -- PostgreSQL
(4, 14, 3, 'Working knowledge of Docker', NOW(), NOW());  -- Docker

-- Michael Brown (DevOps Engineer)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(5, 14, 5, 'Expert in Docker containerization', NOW(), NOW()),  -- Docker
(5, 15, 5, 'Expert in Kubernetes orchestration', NOW(), NOW()),  -- Kubernetes
(5, 16, 5, 'Expert in AWS cloud services', NOW(), NOW()),  -- AWS
(5, 17, 5, 'Expert in Git', NOW(), NOW()),  -- Git
(5, 9, 3, 'Working knowledge of Node.js for scripting', NOW(), NOW());  -- Node.js

-- Emily Davis (Database Administrator)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(6, 11, 5, 'Expert in PostgreSQL administration and optimization', NOW(), NOW()),  -- PostgreSQL
(6, 12, 4, 'Proficient in MongoDB', NOW(), NOW()),  -- MongoDB
(6, 13, 5, 'Expert in SQL and database design', NOW(), NOW()),  -- SQL
(6, 14, 3, 'Working knowledge of Docker for database containers', NOW(), NOW()),  -- Docker
(6, 8, 2, 'Basic knowledge of Java', NOW(), NOW());  -- Java

-- David Miller (Project Manager)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(7, 17, 4, 'Proficient in Git for project management', NOW(), NOW()),  -- Git
(7, 13, 3, 'Good understanding of SQL for reporting', NOW(), NOW());  -- SQL

-- Sarah Wilson (UI/UX Designer)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(8, 5, 5, 'Expert in HTML/CSS', NOW(), NOW()),  -- HTML/CSS
(8, 1, 3, 'Good knowledge of React for prototyping', NOW(), NOW()),  -- React
(8, 17, 3, 'Good knowledge of Git', NOW(), NOW());  -- Git

-- James Taylor (Senior Frontend Developer)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(9, 1, 5, 'Expert in React', NOW(), NOW()),  -- React
(9, 2, 5, 'Expert in Angular', NOW(), NOW()),  -- Angular
(9, 3, 4, 'Proficient in Vue.js', NOW(), NOW()),  -- Vue.js
(9, 4, 5, 'Expert in TypeScript', NOW(), NOW()),  -- TypeScript
(9, 5, 5, 'Expert in HTML/CSS', NOW(), NOW()),  -- HTML/CSS
(9, 17, 4, 'Proficient in Git', NOW(), NOW());  -- Git

-- Emma Anderson (Backend Developer)
INSERT INTO employee_skills (employee_id, skill_id, proficiency_level, notes, created_at, updated_at) VALUES
(10, 7, 4, 'Proficient in Kotlin', NOW(), NOW()),  -- Kotlin
(10, 9, 5, 'Expert in Node.js', NOW(), NOW()),  -- Node.js
(10, 10, 4, 'Proficient in Python', NOW(), NOW()),  -- Python
(10, 12, 5, 'Expert in MongoDB', NOW(), NOW()),  -- MongoDB
(10, 13, 4, 'Proficient in SQL', NOW(), NOW()),  -- SQL
(10, 17, 4, 'Proficient in Git', NOW(), NOW());  -- Git

-- Insert Project Skills
-- E-commerce Platform
INSERT INTO project_skills (project_id, skill_id, importance, minimum_proficiency_required, number_of_people_required, notes, created_at, updated_at) VALUES
(1, 1, 5, 4, 2, 'Need experienced React developers for frontend', NOW(), NOW()),  -- React
(1, 4, 4, 3, 2, 'TypeScript for type safety', NOW(), NOW()),  -- TypeScript
(1, 6, 5, 4, 2, 'Spring Boot for backend services', NOW(), NOW()),  -- Spring Boot
(1, 7, 4, 3, 1, 'Kotlin preferred for backend development', NOW(), NOW()),  -- Kotlin
(1, 11, 4, 3, 1, 'PostgreSQL for data storage', NOW(), NOW()),  -- PostgreSQL
(1, 14, 3, 2, 1, 'Docker for containerization', NOW(), NOW());  -- Docker

-- Mobile Banking App
INSERT INTO project_skills (project_id, skill_id, importance, minimum_proficiency_required, number_of_people_required, notes, created_at, updated_at) VALUES
(2, 8, 5, 4, 2, 'Java for Android development', NOW(), NOW()),  -- Java
(2, 10, 4, 4, 1, 'Python for backend services', NOW(), NOW()),  -- Python
(2, 12, 4, 3, 1, 'MongoDB for data storage', NOW(), NOW()),  -- MongoDB
(2, 16, 3, 3, 1, 'AWS for cloud infrastructure', NOW(), NOW());  -- AWS

-- Customer Portal Redesign
INSERT INTO project_skills (project_id, skill_id, importance, minimum_proficiency_required, number_of_people_required, notes, created_at, updated_at) VALUES
(3, 1, 5, 4, 1, 'React for frontend development', NOW(), NOW()),  -- React
(3, 2, 4, 4, 1, 'Angular experience also valuable', NOW(), NOW()),  -- Angular
(3, 4, 4, 3, 1, 'TypeScript for type safety', NOW(), NOW()),  -- TypeScript
(3, 5, 5, 4, 1, 'Strong HTML/CSS skills required', NOW(), NOW()),  -- HTML/CSS
(3, 9, 4, 3, 1, 'Node.js for backend services', NOW(), NOW());  -- Node.js

-- Data Warehouse Migration
INSERT INTO project_skills (project_id, skill_id, importance, minimum_proficiency_required, number_of_people_required, notes, created_at, updated_at) VALUES
(4, 11, 5, 4, 1, 'PostgreSQL expertise required', NOW(), NOW()),  -- PostgreSQL
(4, 13, 5, 4, 1, 'Advanced SQL skills needed', NOW(), NOW()),  -- SQL
(4, 16, 5, 4, 1, 'AWS for cloud infrastructure', NOW(), NOW()),  -- AWS
(4, 10, 3, 3, 1, 'Python for ETL scripts', NOW(), NOW());  -- Python

-- Internal HR System
INSERT INTO project_skills (project_id, skill_id, importance, minimum_proficiency_required, number_of_people_required, notes, created_at, updated_at) VALUES
(5, 1, 4, 3, 1, 'React for frontend', NOW(), NOW()),  -- React
(5, 6, 5, 4, 2, 'Spring Boot for backend', NOW(), NOW()),  -- Spring Boot
(5, 7, 4, 3, 1, 'Kotlin preferred for backend', NOW(), NOW()),  -- Kotlin
(5, 11, 4, 3, 1, 'PostgreSQL for data storage', NOW(), NOW());  -- PostgreSQL

-- DevOps Toolchain Upgrade
INSERT INTO project_skills (project_id, skill_id, importance, minimum_proficiency_required, number_of_people_required, notes, created_at, updated_at) VALUES
(6, 14, 5, 4, 1, 'Docker expertise required', NOW(), NOW()),  -- Docker
(6, 15, 5, 4, 1, 'Kubernetes expertise required', NOW(), NOW()),  -- Kubernetes
(6, 16, 5, 4, 1, 'AWS expertise required', NOW(), NOW()),  -- AWS
(6, 17, 4, 3, 1, 'Git workflow optimization', NOW(), NOW());  -- Git

-- Insert Project Assignments (manual assignments to start with)
-- Mobile Banking App Assignments
INSERT INTO project_assignments (project_id, employee_id, role, allocation_percentage, start_date, end_date, is_automatically_assigned, notes, created_at, updated_at) VALUES
(2, 3, 'Backend Lead', 80, '2025-04-15', '2025-09-30', false, 'Assigned manually as lead developer', NOW(), NOW()),
(2, 10, 'Backend Developer', 60, '2025-04-15', '2025-08-15', false, 'Assigned for Python and MongoDB work', NOW(), NOW()),
(2, 5, 'DevOps Support', 30, '2025-04-15', '2025-05-15', false, 'Initial AWS infrastructure setup', NOW(), NOW());

-- Customer Portal Redesign Assignments
INSERT INTO project_assignments (project_id, employee_id, role, allocation_percentage, start_date, end_date, is_automatically_assigned, notes, created_at, updated_at) VALUES
(3, 9, 'Frontend Lead', 100, '2025-03-01', '2025-06-30', false, 'Assigned as frontend lead for redesign', NOW(), NOW()),
(3, 2, 'Frontend Developer', 80, '2025-03-01', '2025-06-30', false, 'Supporting frontend development', NOW(), NOW()),
(3, 8, 'UI/UX Designer', 100, '2025-03-01', '2025-04-30', false, 'Designing the new portal interface', NOW(), NOW());

-- Data Warehouse Migration Assignments (completed project)
INSERT INTO project_assignments (project_id, employee_id, role, allocation_percentage, start_date, end_date, is_automatically_assigned, notes, created_at, updated_at) VALUES
(4, 6, 'Database Lead', 100, '2025-01-15', '2025-04-15', false, 'Led the database migration efforts', NOW(), NOW()),
(4, 5, 'Cloud Infrastructure', 70, '2025-01-15', '2025-04-15', false, 'Set up AWS infrastructure for the warehouse', NOW(), NOW()),
(4, 10, 'ETL Developer', 50, '2025-01-15', '2025-03-31', false, 'Developed ETL processes for data migration', NOW(), NOW());

-- DevOps Toolchain Upgrade Assignments
INSERT INTO project_assignments (project_id, employee_id, role, allocation_percentage, start_date, end_date, is_automatically_assigned, notes, created_at, updated_at) VALUES
(6, 5, 'DevOps Lead', 70, '2025-02-01', '2025-05-31', false, 'Leading the DevOps toolchain upgrade', NOW(), NOW());