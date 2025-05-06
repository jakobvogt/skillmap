# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the backend for a Skillmap application, a Spring Boot project written in Kotlin. The application manages employees, skills, projects, and their relationships, helping to track and allocate people with the right skills to appropriate projects.

## Development Commands

### Setup and Database

```bash
# Start the PostgreSQL database container
docker-compose up -d

# Stop the database container
docker-compose down
```

### Building and Running

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun

# Run tests
./gradlew test

# Run a single test class
./gradlew test --tests "dev.skillmap.YourTestClass"
```

## Architecture

The application follows a standard Spring Boot architecture with:

1. **Controller Layer** (`controller/`) - REST endpoints for API access
2. **Service Layer** (`service/`) - Business logic implementation
3. **Repository Layer** (`repository/`) - Data access interfaces
4. **Entity Layer** (`entity/`) - JPA entities representing database tables
5. **DTO Layer** (`dto/`) - Data transfer objects for API communication

### Data Model

- **Employee**: Stores information about employees (name, email, position, department)
- **Skill**: Represents skills with names, categories, and descriptions
- **Project**: Contains project details including timeframe, budget, and status
- **EmployeeSkill**: Junction entity linking employees to skills with proficiency levels
- **ProjectSkill**: Junction entity linking projects to required skills with importance levels
- **ProjectAssignment**: Junction entity linking employees to projects with roles and allocation percentages

### Key Technologies

- Kotlin 1.9.25
- Spring Boot 3.4.4
- JPA/Hibernate for database operations
- PostgreSQL for database
- Flyway for database migrations
- JUnit 5 for testing

### CORS Configuration

The application has CORS enabled for the frontend, which runs on `http://localhost:5173`.

### API Endpoints

The application exposes RESTful endpoints under `/api`:

- `/api/employees` - Employee management
- `/api/skills` - Skill management
- `/api/projects` - Project management
- `/api/employee-skills` - Employee-skill associations
- `/api/project-skills` - Project-skill requirements
- `/api/project-assignments` - Employee-project assignments