import type { ProjectInfo } from "../types.js";

function command(value: string): string {
  return value || "Not detected; confirm with the maintainer.";
}

export function generatedFiles(project: ProjectInfo): Record<string, string> {
  const stack = project.languages.length > 0 ? project.languages.join(", ") : "Not detected";
  const directories =
    project.directories.length > 0
      ? project.directories.map((directory) => `- \`${directory}/\``).join("\n")
      : "- No conventional directories detected yet.";

  const config = {
    projectName: project.projectName,
    defaultBranch: project.defaultBranch,
    packageManager: project.packageManager,
    commands: project.commands,
    agent: {
      name: "Codex",
      requirePlanBeforeChanges: true,
      allowAutoPr: false,
      protectedAreas: [
        "authentication",
        "authorization",
        "release",
        "deployment",
        "security",
        "billing",
      ],
    },
  };

  return {
    "AGENTS.md": `# AGENTS.md

## Project Overview

${project.projectName} is maintained with human approval gates and AI-assisted development.

## Technology Stack

${stack}

## Directory Structure

${directories}

## Development Commands

- Install: \`${command(project.commands.install)}\`
- Build: \`${command(project.commands.build)}\`
- Test: \`${command(project.commands.test)}\`
- Lint: \`${command(project.commands.lint)}\`
- Format: \`${command(project.commands.format)}\`

## Working Rules

- Codex should propose a plan before making large changes.
- Codex should keep changes small and reviewable.
- Codex should run tests before suggesting a pull request.
- Do not make unrelated formatting or refactoring changes.
- Do not overwrite user work or use destructive Git commands.

## Human Approval Required

Codex must not change public APIs, authentication, authorization, release settings, deployment, billing, or security-sensitive code without explicit human approval.

## Pre-PR Checklist

- [ ] Change is small and focused
- [ ] Tests were added or updated
- [ ] Existing tests pass
- [ ] Lint and build pass
- [ ] Documentation is updated if needed
- [ ] No unrelated changes are included
`,
    ".github/ISSUE_TEMPLATE/bug_report.md": `---
name: Bug report
about: Report a reproducible problem
title: "[Bug] "
labels: bug
---

## Summary

## Steps to Reproduce

1.

## Expected Behavior

## Actual Behavior

## Environment

## Additional Context
`,
    ".github/ISSUE_TEMPLATE/feature_request.md": `---
name: Feature request
about: Propose a focused improvement
title: "[Feature] "
labels: enhancement
---

## Problem

## Proposed Outcome

## Acceptance Criteria

## Alternatives

## Additional Context
`,
    ".github/PULL_REQUEST_TEMPLATE.md": `## Summary

## Testing

## Risks

## Human Approval

- [ ] This change does not modify a protected area
- [ ] Required maintainer approval has been obtained

## Checklist

- [ ] The change is small and focused
- [ ] Tests were added or updated
- [ ] Existing tests pass
- [ ] Documentation was updated if needed
- [ ] No unrelated formatting changes
`,
    ".maintainerkit/config.json": `${JSON.stringify(config, null, 2)}\n`,
    ".maintainerkit/prompts/triage.md": `You are Codex acting as an OSS maintainer. Analyze the supplied issue, identify missing information, classify its readiness, and flag protected areas that require human approval.
`,
    ".maintainerkit/prompts/plan.md": `You are Codex acting as the primary developer. Produce a small, reviewable implementation plan with tests, risks, approval requirements, and a pre-PR checklist.
`,
    "docs/maintenance.md": `# Maintenance

Use issue triage before implementation. Keep changes focused, run the detected project checks, and retain human approval for protected areas.
`,
    "docs/architecture.md": `# Architecture

## Overview

Technology: ${stack}

## Main Directories

${directories}

Update this document when architectural boundaries become clearer.
`,
    "docs/testing.md": `# Testing

## Commands

- Test: \`${command(project.commands.test)}\`
- Lint: \`${command(project.commands.lint)}\`
- Build: \`${command(project.commands.build)}\`

Add focused regression tests for bug fixes and behavior tests for new features.
`,
  };
}
