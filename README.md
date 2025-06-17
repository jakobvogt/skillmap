# SkillMap - Project Management Matching Tool

SkillMap is a web application designed to help project managers assign team members to projects based on their skills and proficiency levels. It provides a centralized platform for maintaining employee skill profiles and project requirements, enabling optimal team formation.

## Problem Statement

In agile project management, project leaders often struggle to assign team members based on their skills and technology stack. Without clear visibility into who has which skills, this process becomes time-consuming and inefficient.

SkillMap addresses this by:
- Allowing employees to maintain profiles with their technical skills and proficiency levels
- Enabling project managers to create project profiles with required skills and technologies
- Providing automatic matching of employees to projects based on skill requirements

## Technology Stack

### Backend
- **Framework**: Spring Boot with Kotlin
- **Database**: PostgreSQL
- **Migration**: Flyway
- **Build Tool**: Gradle (Kotlin DSL)

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: Custom components with shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router

## Features

### Employee Management
- Create, view, update, and delete employee profiles
- Assign skills to employees with proficiency levels
- Search and filter employees

### Project Management
- Create, view, update, and delete projects
- Define required skills for projects with importance levels
- Track project status, budget, and timeline

### Skill Management
- Maintain a catalog of skills with categories
- Associate skills with employees and projects

### Assignment Management
- Assign employees to projects manually
- View current project assignments
- Track employee allocation across projects
- (Planned) Automatically match employees to projects based on skills

## Getting Started

### Prerequisites
- JDK 21
- Node.js (latest LTS version)
- Docker

### Backend Setup
1. Clone the repository
2. Navigate to the backend directory
3. Start the PostgreSQL database container:
```bash
docker compose up -d
```
4. Run the backend:
```bash
./gradlew bootRun
```

### Frontend Setup
1. Navigate to the frontend directory
2. Install dependencies:
```bash
pnpm install
```
3. Start the development server:
```bash
pnpm run dev
```

## Project Structure

### Backend
The backend follows a standard Spring Boot architecture:
- **Controllers**: Handle HTTP requests
- **Services**: Implement business logic
- **Repositories**: Interface with the database
- **Entities**: Represent database tables
- **DTOs**: Transfer data between layers

### Frontend
The frontend is organized by features:
- **api/**: API client and types
- **components/**: Reusable UI components
- **pages/**: Page components for different routes
- **lib/**: Utility functions

## Database Schema
The application uses the following main entities:
- **Employees**: Store user information
- **Skills**: Catalog of available skills
- **EmployeeSkills**: Map skills to employees with proficiency levels
- **Projects**: Project information and status
- **ProjectSkills**: Skills required for projects with importance levels
- **ProjectAssignments**: Employee assignments to projects

## Future Improvements
- Implement automatic matching algorithm for optimal project staffing
- Many other improvements (so far, the frontend is pretty much just CRUD)
  - Improved UI/UX for manual assignements (drag-and-drop)
  - Show total assignment allocation for employees
  - Add data visualization for skills distribution
  - ...
- Implement sign up, login, and role-based access control
