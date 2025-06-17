# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the backend code.

See @README.md for backend overview and commands.

## Claude Code Specific Notes

### Spring Boot Patterns
- When creating new endpoints, follow the existing controller/service/repository pattern
- Use DTOs for all API requests/responses - never expose entities directly
- Add appropriate exception handling using the existing exception classes

### Database Changes
- Always create Flyway migrations for schema changes in `src/main/resources/db/migration/`
- Follow the naming convention: `V{version}__description.sql`

### Testing
- When adding new features, create corresponding test classes
- Use `@SpringBootTest` for integration tests
- Use `@WebMvcTest` for controller tests
- Mock external dependencies in unit tests