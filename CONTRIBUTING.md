# Contributing

Thank you for helping improve MaintainerKit.

## Development

1. Use Node.js 20 or newer.
2. Install dependencies with `pnpm install`.
3. Keep changes small and focused.
4. Add or update tests.
5. Run the complete verification suite:

```bash
pnpm lint
pnpm test
pnpm build
pnpm format:check
pnpm test:e2e
pnpm test:package
```

Do not include unrelated formatting changes. Changes to public APIs, security-sensitive behavior, release automation, or GitHub write operations require explicit maintainer approval.
