import { describe, expect, it } from "vitest";
import { planIssue } from "../src/core/planIssue.js";
import { renderPlan } from "../src/core/renderers.js";
import type { ProjectInfo } from "../src/types.js";

const project: ProjectInfo = {
  rootDir: "/fixture",
  projectName: "fixture",
  defaultBranch: "main",
  packageManager: "pnpm",
  languages: ["TypeScript"],
  directories: ["src", "tests", "docs"],
  commands: {
    install: "pnpm install",
    build: "pnpm build",
    test: "pnpm test",
    lint: "pnpm lint",
    format: "pnpm format",
  },
};

describe("planIssue", () => {
  it("renders a Markdown plan with risks and the pre-PR checklist", () => {
    const markdown = renderPlan(
      planIssue("設定ファイルがない場合はデフォルト設定で起動できるようにしたい"),
    );

    expect(markdown).toContain("# Implementation Plan");
    expect(markdown).toContain("## Risks");
    expect(markdown).toContain("## Pre-PR Checklist");
    expect(markdown).toContain("- [ ] Existing tests pass");
  });

  it("requires approval for protected areas", () => {
    const plan = planIssue("Change the authentication flow", project);

    expect(plan.humanApprovalRequired).toBe(true);
    expect(plan.risks[0]).toContain("protected areas");
  });

  it("uses repository directories for likely source and test files", () => {
    expect(planIssue("Fix a crash in the parser", project).filesLikelyToChange).toEqual([
      "src/",
      "tests/",
    ]);
  });

  it("creates documentation-specific steps and validation", () => {
    const plan = planIssue("Update the README installation guide", project);

    expect(plan.filesLikelyToChange).toEqual(["README.md or relevant files under docs/"]);
    expect(plan.proposedSteps).toContain(
      "Validate commands, links, and examples against the current implementation.",
    );
    expect(plan.tests).toContain("Run available formatting, link, or documentation checks.");
    expect(plan.proposedSteps.join(" ")).not.toContain("Add a regression test");
  });

  it("creates bug-specific regression steps", () => {
    const plan = planIssue(
      "The CLI crashes when the config file is missing. Steps: run without a config on Node 22.",
      project,
    );

    expect(plan.proposedSteps).toContain(
      "Add a regression test that fails before the fix and passes afterward.",
    );
    expect(plan.tests[0]).toBe("Add a regression test for the reported failure.");
  });

  it.each([
    ["feature", "Add support for JSON output", "acceptance criteria"],
    ["refactor", "Refactor the parser structure", "observable behavior"],
    ["test", "Increase parser test coverage", "untested behavior"],
    ["question", "Why does the parser use this fallback?", "authoritative project documentation"],
  ] as const)("creates %s-specific implementation steps", (_type, issue, expectedText) => {
    const plan = planIssue(issue, project);

    expect(plan.proposedSteps.join(" ")).toContain(expectedText);
  });
});
