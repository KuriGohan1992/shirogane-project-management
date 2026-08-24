## Testing

Shiro uses a layered test strategy:

- **Vitest unit tests** cover validation, permissions, filters, board ordering, analytics/date helpers, notifications, activity formatting, and other deterministic domain logic.
- **Vitest database integration tests** validate project/task lifecycles, collaborator permissions and assignments, notification persistence, and PostgreSQL integrity rules against a dedicated test database.
- **Playwright** covers public and authenticated browser smoke flows, including Clerk sign-in, primary navigation, theme switching, project/task creation, keyboard shortcuts, and cleanup.

```bash
pnpm test          # unit tests
pnpm test:db       # database integration tests
pnpm test:e2e      # Playwright browser tests
pnpm test:all      # all test layers
```

Database tests require a dedicated `TEST_DATABASE_URL`. Playwright authentication uses Clerk development credentials and an existing `E2E_CLERK_USER_EMAIL`. See [`TESTING.md`](TESTING.md) for setup and safety requirements.
