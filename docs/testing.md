# Testing

## Commands

- Test: `pnpm test`
- Coverage: `pnpm test:coverage`
- Lint: `pnpm lint`
- Build: `pnpm build`
- Format check: `pnpm format:check`
- Built CLI: `pnpm test:e2e`
- Packed package: `pnpm test:package`

Unit tests cover deterministic core behavior and filesystem generation. The CLI smoke test verifies built command behavior and exit codes. The package smoke test packs, installs, and executes the same artifact intended for npm.

Before a pull request, run:

```bash
pnpm lint
pnpm test:coverage
pnpm build
pnpm format:check
pnpm test:e2e
pnpm test:package
```

Coverage measures deterministic core and utility modules. CLI adapters are exercised by the built
CLI and packed-package smoke tests instead.
