# MaintainerKit

[![CI](https://github.com/fishfillet-krm/maintainerkit/actions/workflows/ci.yml/badge.svg)](https://github.com/fishfillet-krm/maintainerkit/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/fishfillet-krm/maintainerkit?display_name=tag)](https://github.com/fishfillet-krm/maintainerkit/releases)
[![npm](https://img.shields.io/npm/v/maintainerkit)](https://www.npmjs.com/package/maintainerkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%20%7C%2022%20%7C%2024-43853d)](package.json)

[日本語](README.ja.md)

MaintainerKit is an open-source toolkit for preparing repositories for AI-assisted maintenance. It helps small and mid-sized OSS maintainers safely delegate routine development work to Codex by generating agent instructions, issue templates, PR checklists, triage reports, and implementation plans.

The toolkit keeps humans responsible for product decisions and sensitive changes. It does not write to GitHub, create pull requests, or call an external AI service.

> **Project status:** MaintainerKit is an early `0.x` project. Its rule-based output and generated
> files require maintainer review. See [known limitations](docs/known-limitations.md).

## Why MaintainerKit?

AI coding agents work best when a repository clearly documents its structure, commands, constraints, and approval boundaries. MaintainerKit creates that foundation and turns incomplete issue text into a consistent triage report or implementation plan.

## Requirements

- Node.js 20 or newer
- pnpm for development

## Installation

Install the CLI from npm:

```bash
npm install --global maintainerkit
```

Then run:

```bash
maintainerkit --help
```

You can also run a one-off command without a global installation:

```bash
npx maintainerkit --help
```

## Quick Start

Prepare the current repository:

```bash
maintainerkit init
```

Existing files are preserved. Use `--force` only when you intentionally want to replace generated files:

```bash
maintainerkit init --force
```

Triage an issue:

```bash
maintainerkit triage --text "The app crashes when the config file is missing"
maintainerkit triage --file issue.md
```

Generate an implementation plan:

```bash
maintainerkit plan --text "Start with default settings when no config file exists"
maintainerkit plan --file issue.md
```

Generate a prompt for Codex or another AI instead:

```bash
maintainerkit triage --file issue.md --prompt-only
maintainerkit plan --file issue.md --prompt-only
```

## Commands

### `maintainerkit init`

Detects common project metadata and generates:

- `AGENTS.md`
- GitHub issue and pull request templates
- `.maintainerkit/config.json`
- reusable triage and planning prompts
- maintenance, architecture, and testing documents

Detection uses lockfiles, `package.json`, scripts, conventional directories, and common language files. Unknown commands are left explicit instead of guessed.

### `maintainerkit triage`

Uses deterministic Japanese and English keyword rules to produce:

- issue type and suggested labels
- priority and difficulty
- likely affected areas
- missing information
- next action and Codex readiness

### `maintainerkit plan`

Produces a small, reviewable implementation plan with likely files, steps, tests, risks, approval requirements, and a pre-PR checklist.

## Using Codex as the Primary Developer

1. Run `maintainerkit init` and review the generated repository guidance.
2. Triage an issue and resolve missing information.
3. Generate and approve an implementation plan.
4. Ask Codex to implement the focused plan.
5. Review the changes and test results before creating a pull request.

## Safety Design

- Files are not overwritten without `--force`.
- MaintainerKit does not write to GitHub or create pull requests.
- Authentication, authorization, security, billing, deployment, and release work is blocked for explicit human approval.
- Generated plans always contain risks and a pre-PR checklist.
- Rule-based output is transparent and works without credentials or network access.

See [Architecture](docs/architecture.md), [Governance](GOVERNANCE.md), and the
[known limitations](docs/known-limitations.md) for the trust boundaries.

## Evidence

- [Read-only OSS case studies](docs/case-studies.md)
- [Owner-operated mc-localize adoption pilot](https://github.com/fishfillet-krm/mc-localize/pull/15)
- [Impact report and baseline metrics](docs/impact-report.md)

## Development

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
pnpm format:check
pnpm test:e2e
pnpm test:package
```

Or run the complete suite:

```bash
pnpm verify
```

## Roadmap

- GitHub issue retrieval and label suggestions
- Codex work loops with branch and pull request automation
- changelog and release preparation
- repository Agent Readiness Score

All future write operations will remain opt-in and approval-gated.

## Repository

- Source: [github.com/fishfillet-krm/maintainerkit](https://github.com/fishfillet-krm/maintainerkit)
- Issues: [github.com/fishfillet-krm/maintainerkit/issues](https://github.com/fishfillet-krm/maintainerkit/issues)
- Discussions: [github.com/fishfillet-krm/maintainerkit/discussions](https://github.com/fishfillet-krm/maintainerkit/discussions)
- Roadmap: [ROADMAP.md](ROADMAP.md)
- Support: [SUPPORT.md](SUPPORT.md)

## License

[MIT](LICENSE)
