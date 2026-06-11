import { describe, expect, it } from "vitest";
import type { ProjectInfo } from "../src/types.js";
import { generatedFiles } from "../src/core/templates.js";

const project: ProjectInfo = {
  rootDir: "/tmp/example",
  projectName: "example",
  defaultBranch: "main",
  packageManager: "pnpm",
  languages: ["TypeScript"],
  directories: ["src", "tests", "docs", ".github"],
  commands: {
    install: "pnpm install",
    build: "pnpm build",
    test: "pnpm test",
    lint: "pnpm lint",
    format: "pnpm format",
  },
};

describe("generated file golden contract", () => {
  it("keeps the expected file inventory", () => {
    expect(Object.keys(generatedFiles(project)).sort()).toEqual([
      ".github/ISSUE_TEMPLATE/bug_report.md",
      ".github/ISSUE_TEMPLATE/feature_request.md",
      ".github/PULL_REQUEST_TEMPLATE.md",
      ".maintainerkit/config.json",
      ".maintainerkit/prompts/plan.md",
      ".maintainerkit/prompts/triage.md",
      "AGENTS.md",
      "docs/architecture.md",
      "docs/maintenance.md",
      "docs/testing.md",
    ]);
  });

  it("keeps safety-critical generated guidance", () => {
    const files = generatedFiles(project);
    expect(files["AGENTS.md"]).toMatchInlineSnapshot(`
      "# AGENTS.md

      ## Project Overview

      example is maintained with human approval gates and AI-assisted development.

      ## Technology Stack

      TypeScript

      ## Directory Structure

      - \`src/\`
      - \`tests/\`
      - \`docs/\`
      - \`.github/\`

      ## Development Commands

      - Install: \`pnpm install\`
      - Build: \`pnpm build\`
      - Test: \`pnpm test\`
      - Lint: \`pnpm lint\`
      - Format: \`pnpm format\`

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
      "
    `);
    expect(files[".maintainerkit/config.json"]).toContain('"allowAutoPr": false');
    expect(files[".github/PULL_REQUEST_TEMPLATE.md"]).toContain("## Risks");
  });
});
