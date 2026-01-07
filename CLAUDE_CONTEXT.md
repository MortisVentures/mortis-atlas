# Mortis Atlas - Claude Context

## Current State
- Phase 1 (Foundation) - ✅ COMPLETE
- Next.js 14 with TypeScript and App Router
- Prisma ORM connected to Supabase PostgreSQL
- shadcn/ui component library installed
- Dark mode configured

## Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Database: PostgreSQL (Supabase)
- ORM: Prisma
- UI Components: shadcn/ui
- Package Manager: pnpm

## Database Schema
Current models:
- User (authentication)
- Company (CRM core)
- Contact (people management)
- Deal (investment tracking)
- Activity (interaction logging)
- Tag (categorization)

## Next Steps (Phase 2)
- [ ] Build company list view
- [ ] Create company detail pages
- [ ] Add search and filtering
- [ ] Implement CRUD operations

## Coding Conventions
- Use TypeScript strict mode
- Follow Next.js 14 App Router patterns
- Keep components in src/components/
- Use server components by default, client components when needed
- Prisma queries in server components or API routes

## Important Notes
- Database URL stored in .env.local (not committed)
- Always run `pnpm dlx prisma generate` after schema changes
- Test immediately after implementing features

Last updated: January 6, 2026
