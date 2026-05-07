# Tests

All tests are in `__tests__/auditEngine.test.ts`.

## How to run

```bash
npm test
# or for watch mode:
npm test -- --watch
```

## Test list

| # | File | What it covers |
|---|---|---|
| 1 | `__tests__/auditEngine.test.ts` | Cursor Business ≤2 seats → recommends Pro downgrade, saves $40/mo |
| 2 | `__tests__/auditEngine.test.ts` | Cursor Pro 1 seat → flagged as optimal, $0 savings |
| 3 | `__tests__/auditEngine.test.ts` | GitHub Copilot Business 1 seat → recommends Individual, saves $9/mo |
| 4 | `__tests__/auditEngine.test.ts` | Claude Team ≤2 seats → recommends Pro, saves $20/mo |
| 5 | `__tests__/auditEngine.test.ts` | Multi-tool input → total savings is correctly summed |
| 6 | `__tests__/auditEngine.test.ts` | Anthropic API spend >$100 → recommends caching optimisations |
| 7 | `__tests__/auditEngine.test.ts` | ChatGPT Enterprise <10 seats → recommends Team downgrade |
| 8 | `__tests__/auditEngine.test.ts` | Audit result has valid non-empty ID and ISO timestamp |

## Coverage scope

All 8 tests target the core audit engine (`src/lib/auditEngine.ts`). The engine is pure TypeScript with no external dependencies in the test path, so tests run without mocking the database or AI API.
