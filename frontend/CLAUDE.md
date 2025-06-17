# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the frontend code.

See @README.md for frontend overview and commands.

## Claude Code Specific Notes

### Component Patterns
- Use existing UI components from `src/components/ui/` (shadcn/ui)
- Follow the existing pattern for forms with react-hook-form and zod validation
- Create new page components in the appropriate feature directory under `src/pages/`

### API Integration
- All API calls should go through the centralized client in `src/api/`
- TypeScript types should mirror backend DTOs exactly
- Handle errors consistently using try-catch patterns

### Styling
- Use Tailwind CSS classes for styling
- Follow existing component patterns for consistent UI
- Avoid inline styles unless absolutely necessary