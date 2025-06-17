# SkillMap Frontend

React + TypeScript frontend for the SkillMap application.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

## Development Commands

```bash
pnpm run build    # Build for production
pnpm run lint     # Run ESLint
pnpm run preview  # Preview production build
```

## Architecture

The frontend uses a feature-based organization:

- **API Client** (`src/api/`) - Centralized API calls with TypeScript types
- **Pages** (`src/pages/`) - Feature-specific components
  - `employees/` - Employee management
  - `projects/` - Project management
  - `skills/` - Skills catalog
  - `assignments/` - Project assignments dashboard
- **Components** (`src/components/`) - Reusable UI components
  - `ui/` - Base components (shadcn/ui)
  - `layout/` - Layout components

## Technology Stack

- **Build Tool**: Vite
- **UI Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui
- **Forms**: react-hook-form
- **Routing**: React Router