# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## Project Architecture

This is a React-based frontend for the SkillMap application, built with:

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **TailwindCSS** - Styling 
- **Radix UI** - Accessible UI primitives
- **TanStack Table** - Data tables
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Key Structure

- **API Layer** (`src/api/`)
  - `api-client.ts`: Contains client functions for all API endpoints
  - `types.ts`: TypeScript interfaces for all data models

- **Components** (`src/components/`)
  - `layout/`: Layout components like AppShell
  - `ui/`: Reusable UI components (buttons, inputs, etc.)

- **Pages** (`src/pages/`)
  - Feature-specific pages organized by domain (employees, projects, skills, etc.)
  - Each main entity has its own directory with list and detail views

### Application Flow

1. The app initializes in `main.tsx` and renders the main `App` component
2. `App.tsx` sets up routing with `react-router-dom`
3. All routes are wrapped in `AppShell` which provides the common layout (sidebar, navigation)
4. Feature pages use the API client to fetch data from the backend
5. UI components are used to build interfaces

### Data Model

The application manages several core entities:

- **Employees**: People with skills and assignments
- **Skills**: Abilities that employees can have and projects can require
- **Projects**: Work initiatives that require skills and have employees assigned
- **EmployeeSkills**: Many-to-many relationship between employees and skills with proficiency level
- **ProjectSkills**: Many-to-many relationship between projects and required skills
- **ProjectAssignments**: Assignments of employees to projects with allocation percentage

### State Management

The application uses React's built-in hooks for state management:
- `useState` for component-local state
- `useEffect` for side effects like API calls

### API Communication

All backend communication happens through the functions in `api-client.ts`, which provides:
- Type-safe methods for CRUD operations on all entities
- Error handling
- Consistent response formatting

### Path Aliasing

The project uses path aliases:
- `@/` points to the `src/` directory

## Git Commits

When committing changes:
- Omit "generated with Claude Code" and "Co-Authored-By: Claude" phrases from commit messages