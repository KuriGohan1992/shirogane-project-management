# Shiro testing suite

This bundle adds three testing layers:

1. **Vitest unit tests** for pure domain logic, filters, validation, board ordering, dates, notifications, permissions, routes, and keyboard helpers.
2. **Vitest database integration tests** for projects, tasks, permissions, collaborator assignments, notifications, and schema constraints.
3. **Playwright end-to-end tests** for the public landing page, Clerk-authenticated navigation, theme switching, project/task creation, keyboard shortcuts, and cleanup.

## 1. Install test dependencies

From the Shiro repository root:

```bash
pnpm add -D vitest jsdom @playwright/test @clerk/testing
pnpm exec playwright install chromium
```

## 2. Add package scripts

Run:

```bash
pnpm pkg set scripts.test="vitest run --config vitest.config.mts"
pnpm pkg set scripts.test:watch="vitest --config vitest.config.mts"
pnpm pkg set scripts.test:db="vitest run --config vitest.db.config.mts"
pnpm pkg set scripts.db:test:migrate="drizzle-kit migrate --config drizzle.test.config.ts"
pnpm pkg set scripts.test:e2e="playwright test"
pnpm pkg set scripts.test:e2e:ui="playwright test --ui"
pnpm pkg set scripts.test:all="pnpm test && pnpm test:db && pnpm test:e2e"
```

## 3. Ignore local test artifacts

Add these lines to `.gitignore`:

```gitignore
.env.test.local
playwright/.clerk/
playwright-report/
test-results/
```

Commit `.env.test.example`; do not commit `.env.test.local`.

## 4. Unit tests

Unit tests need no database and are the fastest feedback loop:

```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

The unit suite covers:

- owner/member/viewer permissions;
- project filter parsing, schedule rules, status rules, and sorting;
- task filter parsing, active filter counts, query/priority/label/assignee/due/completion matching;
- local board stage and task ordering;
- drag-and-drop IDs;
- project/task/stage/comment/label/member/user validation;
- analytics periods and UTC ranges;
- calendar date helpers;
- assignment candidate rules;
- notification preferences, messages, categories, and links;
- activity messages;
- task URL slug generation;
- Shiro color mapping;
- keyboard command helpers.

## 5. Database integration tests

Use a **dedicated test database**. A Neon branch/database is ideal.

Create the local file:

```bash
cp .env.test.example .env.test.local
```

Fill in:

```env
TEST_DATABASE_URL=...
ALLOW_TEST_DATABASE_RESET=true
```

The suite refuses to run when `TEST_DATABASE_URL` is identical to `DATABASE_URL`, and it also requires the explicit reset switch.

Apply Shiro's migrations to the test database:

```bash
pnpm db:test:migrate
```

Then run:

```bash
pnpm test:db
```

The database suite creates users whose Clerk IDs begin with `test_` and cleans those test users after each test file. Deleting those users cascades their test projects and related records.

Do not point `TEST_DATABASE_URL` at development or production data.

## 6. Playwright + Clerk

The E2E suite uses Clerk's official Playwright testing helpers and a development Clerk instance.

In `.env.test.local`, add:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
E2E_CLERK_USER_EMAIL=existing-test-user@example.com
```

`E2E_CLERK_USER_EMAIL` must already exist in the same Clerk development instance. When the authenticated test first opens `/dashboard`, Shiro's normal current-user synchronization will ensure the corresponding database user exists.

Playwright maps `TEST_DATABASE_URL` to the application's `DATABASE_URL` for the test server, so browser CRUD does not touch your normal development database. It starts an isolated Next.js dev server on port `3100`, so it does not reuse a normal Shiro server running on port `3000`.

Run:

```bash
pnpm test:e2e
```

Interactive UI:

```bash
pnpm test:e2e:ui
```

The authenticated CRUD smoke test creates a uniquely named project and task, verifies them, then deletes the project before finishing.

## 7. Recommended workflow

During normal development:

```bash
pnpm test
pnpm type-check
pnpm check
```

Before a feature merge:

```bash
pnpm test
pnpm test:db
pnpm type-check
pnpm check
pnpm build
```

Before a release/demo:

```bash
pnpm test:all
pnpm type-check
pnpm check
pnpm build
```

## Notes

- Database tests are intentionally serial because they share one test database.
- Browser tests use Chromium by default to keep the suite fast. Add Firefox/WebKit projects later if cross-browser certification becomes important.
- The E2E suite should use Clerk **development** credentials, not production credentials.
- The tests are written against the Shiro structure and behavior present in the repository snapshot used to build this bundle. If a selector changes during the mobile/UI pass, update the affected Playwright locator rather than weakening it to brittle CSS selectors.
