<div align="center">
  <img src="public/shiro-logo.png" alt="Shiro logo" width="72" height="72" />

  # Shiro

  **Project management without the clutter.**

  A full-stack project workspace for Kanban planning, collaboration, deadlines, activity, notifications, and analytics.
</div>

---

## Overview

Shiro is a project management application built with the Next.js App Router. It keeps projects, tasks, people, schedules, and progress in one focused workspace while enforcing project-level permissions on the server.

The application uses Server Components for data-heavy pages, Client Components only where browser interaction is needed, Server Actions for most mutations, Clerk for authentication, Drizzle ORM for typed PostgreSQL access, and Neon for the database.

## Core features

- **Projects and Kanban** — project CRUD, custom stages, drag-and-drop task ordering, completion, archive flows, and activity history.
- **Task management** — priorities, start/due dates, multiple assignees, labels, comments, filtering, bulk actions, and deep-linkable task routes.
- **Collaboration** — Owner, Member, and Viewer roles with server-side permission checks and a shared Team directory.
- **Planning** — dashboard summaries plus Calendar timeline and due-date views.
- **Analytics** — completion trends, task health, priorities, project progress, and collaborator activity.
- **Search and notifications** — authenticated global search, notification preferences, and scheduled due-date reminders.
- **User experience** — light/dark/system themes, keyboard shortcuts, loading states, branded empty/error states, and accessible Radix-based UI primitives.
- **Quality assurance** — unit, real-database integration, and Playwright end-to-end tests.

## Architecture

```text
Browser
  │
  ├─ React Client Components
  │    └─ local UI, filters, keyboard shortcuts, drag-and-drop
  │
  ▼
Next.js App Router
  ├─ Server Components ───── authenticated reads
  ├─ Server Actions ──────── mutations
  └─ API routes
       ├─ /api/search
       ├─ /api/webhooks/clerk
       └─ /api/cron/task-due-reminders
  │
  ├─ Clerk ──────────────── authentication
  ├─ Zod ───────────────── runtime validation
  └─ Drizzle ORM
        │
        ▼
   Neon PostgreSQL
```

Shiro keeps responsibilities separated:

```text
app/               routes, layouts, Server Components, API routes
components/        reusable UI and interactive Client Components
lib/actions/       Server Actions
lib/auth/          authentication and project permissions
lib/validations/   Zod schemas
lib/db/            database and domain operations
lib/services/      cross-domain services such as notifications
stores/            focused client state such as the Kanban board
tests/             unit and database integration tests
e2e/               Playwright browser tests
```

### Server and client state

Shiro does not put all state into one global store:

- PostgreSQL is the authoritative persisted state.
- URL search parameters hold shareable filter/sort state.
- React state handles local UI such as dialogs and inputs.
- Zustand plus optimistic updates handles fast Kanban interactions.
- Clerk owns authentication/session state.

## Roles and permissions

| Capability | Owner | Member | Viewer |
| --- | :---: | :---: | :---: |
| View project | ✓ | ✓ | ✓ |
| Manage tasks | ✓ | ✓ | — |
| Manage stages | ✓ | ✓ | — |
| Assign tasks | ✓ | ✓ | — |
| Edit/complete project | ✓ | — | — |
| Manage collaborators | ✓ | — | — |
| Delete project | ✓ | — | — |

UI visibility is not treated as authorization. Sensitive reads and mutations verify access again on the server.

## Data model

The main relationship is:

```text
User
 └─ Project
     ├─ Project Members
     ├─ Project Labels
     └─ Stage
         └─ Task
             ├─ Assignees
             ├─ Labels
             ├─ Comments
             └─ Activity
```

Shiro currently uses 11 PostgreSQL tables: `users`, `projects`, `project_members`, `project_labels`, `stages`, `tasks`, `task_assignees`, `task_labels`, `task_comments`, `activity_logs`, and `notifications`.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, Radix UI, Lucide |
| Authentication | Clerk |
| Database | Neon PostgreSQL, Drizzle ORM |
| Validation | Zod |
| Client state | Zustand |
| Drag and drop | dnd-kit |
| Charts | Recharts |
| Testing | Vitest, Playwright, Clerk Testing |
| Quality | Biome, TypeScript |
| Deployment | Vercel |

## Getting started

### Requirements

- Node.js 20+
- pnpm
- Neon/PostgreSQL database
- Clerk development application

### Install

```bash
git clone https://github.com/KuriGohan1992/shirogane-project-management.git
cd shirogane-project-management
pnpm install
cp .env.example .env.local
```

Configure `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard

DATABASE_URL=postgresql://...
CRON_SECRET=...
SEED_USER_EMAIL=you@example.com
```

Apply migrations and start Shiro:

```bash
pnpm db:migrate
pnpm dev
```

The application runs at `http://localhost:3000`.

### Optional development seed

```bash
pnpm db:seed
```

The seed creates deterministic demo data, including a Shiro project that mirrors the capstone's development history and roadmap.

## Testing

Shiro uses three testing layers:

- **92 unit tests** for validation, filters, permissions, board logic, dates, notifications, routes, and other deterministic behavior.
- **26 database integration tests** against a dedicated PostgreSQL test database.
- **7 Playwright browser flows** plus Clerk authentication setup for public and authenticated end-to-end behavior.

Create a test environment from `.env.test.example`, migrate the dedicated test database, then run:

```bash
pnpm db:test:migrate
pnpm test:all
```

Useful quality checks:

```bash
pnpm type-check
pnpm check
pnpm build
```

See [`TESTING.md`](TESTING.md) for test-environment setup and safety details.

## Database workflow

After changing `lib/db/schema.ts`:

```bash
pnpm db:generate
pnpm db:migrate
```

For the dedicated test database:

```bash
pnpm db:test:migrate
```

A separate ignored `.env.production.local` can hold `PRODUCTION_DATABASE_URL` for deliberate production migrations:

```bash
pnpm db:production:migrate
```

Review generated migrations before applying them to production.

## Deployment

Shiro is configured for Vercel and includes:

- a Vercel deployment workflow under `.github/workflows/deploy.yml`;
- a Clerk webhook at `/api/webhooks/clerk`;
- a daily due-reminder cron at `/api/cron/task-due-reminders`;
- Vercel Analytics.

Before deploying, configure the production Clerk keys, webhook secret, database URL, cron secret, and Clerk redirect variables. Keep the production database migration history current with the deployed application schema.

## Current focus

The core project-management workflow is implemented. The remaining polish is focused on:

- mobile responsiveness and touch-friendly dense controls;
- final regression QA and demo preparation;
- email-based collaborator invitations;
- later quality-of-life additions such as Team filters, project bookmarks, share links, and project visibility.

The landing-page demo still uses a placeholder YouTube ID until the final walkthrough is recorded.
