# Contributing

Thank you for helping improve MaintainerKit.

## Welcome Contributions

- Focused bug fixes with regression tests
- Improvements to repository detection that remain conservative when metadata is ambiguous
- Japanese and English triage examples and classification tests
- Documentation, accessibility, and cross-platform compatibility improvements
- Reproducible case studies that do not write to the evaluated repository

Start significant behavior or public-interface changes with an issue. Small documentation fixes
and narrowly scoped test improvements may go directly to a pull request.

## Out Of Scope

- Hidden network calls or collection of repository content
- Automatic GitHub writes without an explicit approval design
- Changes that present heuristic output as authoritative security or semantic analysis
- Unrelated formatting, dependency, or refactoring changes bundled into a feature

## Development

1. Use Node.js 20 or newer.
2. Install dependencies with `pnpm install`.
3. Keep changes small and focused.
4. Add or update tests.
5. Run the complete verification suite:

```bash
pnpm verify
```

`pnpm verify` runs linting, coverage tests, build, formatting checks, CLI smoke tests, and packed
package installation tests.

## Pull Requests

- Explain the user-visible problem and the chosen scope.
- Include tests or state why a documentation-only change does not need them.
- Update README, generated guidance, or compatibility evidence when behavior changes.
- Keep generated artifacts and unrelated formatting out of the diff.
- Confirm that no credentials, private repository content, or local machine paths are included.

Changes to public APIs, security-sensitive behavior, release automation, npm publishing, or GitHub
write operations require explicit maintainer approval.
