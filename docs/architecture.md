# Architecture

## Overview

MaintainerKit is an ESM TypeScript CLI for Node.js 20 and newer. Commander owns command parsing, while the core modules remain callable without a terminal.

## Data Flow

1. A command adapter validates and reads CLI input.
2. Core functions detect repository metadata or analyze issue text.
3. Typed results are rendered as Markdown or repository templates.
4. Command adapters write results to standard output and diagnostics to standard error.

## Boundaries

- `src/commands/` contains CLI-specific orchestration.
- `src/core/` contains deterministic project detection, triage, planning, and generation.
- `src/utils/` contains small shared helpers.
- External AI and GitHub APIs are intentionally outside the MVP.

Core logic must not perform Git or GitHub writes. File generation is isolated and preserves existing files unless `--force` is explicit.
