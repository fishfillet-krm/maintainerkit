# Maintenance

Use issue triage before implementation. Keep changes focused, run all checks documented in `docs/testing.md`, and retain human approval for protected areas.

## Release Preparation

1. Confirm the version in `package.json`.
2. Run the complete local verification suite.
3. Inspect `npm pack --dry-run` and verify the CLI entry is executable.
4. Confirm that the version is unused on npm and that release metadata is current.
5. Merge through required CI, CodeQL, dependency review, and package smoke checks.
6. Create the matching Git tag and verify the GitHub Release tarball, checksum, and SBOM.
7. Publish the same version to npm only after explicit maintainer approval.
8. Install from the npm registry in a clean directory and run `--help`, `init`, `triage`, and
   `plan`.

GitHub write operations require an authenticated account exactly matching `fishfillet-krm`. Never use an account beginning with `suma`.

npm publishing currently uses the `fishfillet` account with two-factor authentication enabled.
