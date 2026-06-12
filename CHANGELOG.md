# Changelog

All notable changes to MaintainerKit are documented here.

The project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.2] - 2026-06-12

### Changed

- Update npm installation instructions and make README links work on both npm and GitHub
- Clarify that `triage` and `plan` are local rule-based commands that do not call an AI model
- Expand contribution guidance, release operations, and roadmap status
- Replace version-specific or pre-publication wording that was no longer current

## [0.1.1] - 2026-06-12

### Fixed

- Preserve the executable mode of the packaged CLI entry point for npm installation
- Normalize the npm `bin` path so the `maintainerkit` command is published correctly

### Changed

- Verify the installed CLI entry point mode during package smoke tests

## [0.1.0] - 2026-06-11

### Added

- `maintainerkit init` with non-destructive repository guidance generation
- Rule-based `triage` and `plan` commands
- Prompt-only output for Codex and other AI assistants
- Cross-platform tests for macOS, Linux, and Windows
- OSS governance, community health, and security materials
- Expanded quality, interoperability, and operational evidence
- An owner-operated mc-localize adoption pilot and timestamped impact baseline

[Unreleased]: https://github.com/fishfillet-krm/maintainerkit/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/fishfillet-krm/maintainerkit/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/fishfillet-krm/maintainerkit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/fishfillet-krm/maintainerkit/releases/tag/v0.1.0
