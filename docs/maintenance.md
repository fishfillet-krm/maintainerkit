# Maintenance

Use issue triage before implementation. Keep changes focused, run all checks documented in `docs/testing.md`, and retain human approval for protected areas.

## Release Preparation

1. Confirm the version in `package.json`.
2. Run the complete local verification suite.
3. Inspect `pnpm pack --dry-run`.
4. Confirm npm package-name availability and release metadata.
5. Publish only after explicit maintainer approval.

GitHub write operations require an authenticated account exactly matching `fishfillet-krm`. Never use an account beginning with `suma`.
