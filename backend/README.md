# SkillMap Backend

Spring Boot backend for the SkillMap application.

## Getting Started

```bash
# Start PostgreSQL database
docker compose up -d

# Run the backend server
./gradlew bootRun
```

## Development Commands

```bash
./gradlew test               # Run all tests
./gradlew test --tests "ClassName" # Run specific test class
./gradlew check              # Run all checks including tests
```

## Architecture

The backend follows standard Spring Boot layered architecture:

- **Controllers** (`src/main/kotlin/dev/skillmap/controller/`) - REST API endpoints
- **Services** (`src/main/kotlin/dev/skillmap/service/`) - Business logic
- **Repositories** (`src/main/kotlin/dev/skillmap/repository/`) - Data access with JPA
- **Entities** (`src/main/kotlin/dev/skillmap/entity/`) - Database models
- **DTOs** (`src/main/kotlin/dev/skillmap/dto/`) - Data transfer objects
- **Database Migrations** (`src/main/resources/db/migration/`) - Flyway migrations

## API Conventions

All endpoints follow RESTful conventions:
- `GET /api/{entity}` - List all
- `GET /api/{entity}/{id}` - Get by ID
- `POST /api/{entity}` - Create new
- `PUT /api/{entity}/{id}` - Update existing
- `DELETE /api/{entity}/{id}` - Delete

## Configuration

- Default port: 8080
- Database: PostgreSQL (via Docker)
- CORS enabled for frontend development