# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See @README.md for project overview and structure.

## Monorepo Structure

This is a monorepo containing both frontend and backend applications:

### Backend (Spring Boot + Kotlin)
See @backend/CLAUDE.md for backend-specific guidance.

### Frontend (React + TypeScript)
See @frontend/CLAUDE.md for frontend-specific guidance.

## Development Workflow

1. Start PostgreSQL: `cd backend && docker compose up -d`
2. Start backend: `cd backend && ./gradlew bootRun`
3. Start frontend: `cd frontend && pnpm run dev`

## Cross-Stack Considerations

- Frontend TypeScript types should mirror backend DTOs exactly
- API changes in backend require corresponding updates in `frontend/src/api/`
- Database schema changes require new Flyway migrations
- Keep both frontend and backend running during development for full functionality

## Git Commit Guidelines

When committing changes, use simple and descriptive commit messages. Do NOT include "Generated with Claude Code" or "Co-Authored-By: Claude" lines.