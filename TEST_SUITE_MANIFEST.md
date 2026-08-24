# Shiro test suite manifest

The bundle is intentionally layered so fast deterministic tests stay separate from database and browser tests.

## Included

- 16 Vitest unit test files — 92 test cases.
- 9 Vitest/PostgreSQL integration test files — 26 test cases.
- 2 Playwright browser spec files — 7 end-to-end test cases.
- Clerk Playwright authentication setup.
- Dedicated test-database configuration and safety guards.
- Root Vitest, DB Vitest, Drizzle test, and Playwright configuration.
- `.env.test.example` and setup documentation.
- README replacement section for the repository documentation.

## Main coverage

- project roles and permissions
- project filters and sorting
- task filters
- validation schemas
- board ordering and drag/drop identifiers
- task URL generation
- analytics/date helpers
- notification preferences, display, service filtering, persistence, and cron authorization
- activity display and persistence
- assignment candidate rules
- keyboard helpers
- project lifecycle
- stage lifecycle and task cascade
- task lifecycle, movement, completion, archive/restore, and bulk mutations
- collaborator role changes and task assignments
- project labels and task-label assignments
- comments and author/owner permissions
- global search access boundaries and archived-task exclusion
- database uniqueness/integrity constraints
- public landing navigation and theme switching
- authenticated primary-route smoke coverage
- project/task browser CRUD smoke flow
- global search shortcut and sidebar behavior
