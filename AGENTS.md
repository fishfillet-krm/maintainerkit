# AGENTS.md

## Project Overview

maintainerkit is maintained with human approval gates and AI-assisted development.

## Technology Stack

TypeScript, JavaScript

## Directory Structure

- `src/commands/`: CLI command adapters and input/output handling
- `src/core/`: repository detection, analysis, planning, and templates
- `src/utils/`: shared filesystem and Markdown helpers
- `tests/`: focused unit tests
- `scripts/`: built-CLI and packed-package smoke tests
- `.github/`: issue templates, pull request template, and CI

## Development Commands

- Install: `pnpm install`
- Build: `pnpm build`
- Test: `pnpm test`
- CLI E2E: `pnpm test:e2e`
- Package smoke test: `pnpm test:package`
- Lint: `pnpm lint`
- Format: `pnpm format`

## Working Rules

- Codex should propose a plan before making large changes.
- Codex should keep changes small and reviewable.
- Codex should run tests before suggesting a pull request.
- Do not make unrelated formatting or refactoring changes.
- Do not overwrite user work or use destructive Git commands.

## GitHub Account Safety

- Do not push, create pull requests, publish releases, or otherwise write to GitHub unless the authenticated account is exactly `fishfillet-krm`.
- Verify the authenticated account immediately before every GitHub write operation.
- Never use an account whose name starts with `suma`.
- Stop without writing if the account cannot be verified.

## Human Approval Required

Codex must not change public APIs, authentication, authorization, release settings, deployment, billing, or security-sensitive code without explicit human approval.

## Pre-PR Checklist

- [ ] Change is small and focused
- [ ] Tests were added or updated
- [ ] Existing tests pass
- [ ] Lint and build pass
- [ ] Documentation is updated if needed
- [ ] No unrelated changes are included
