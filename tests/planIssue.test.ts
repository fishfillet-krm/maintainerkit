import { describe, expect, it } from "vitest";
import { planIssue } from "../src/core/planIssue.js";
import { renderPlan } from "../src/core/renderers.js";

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
    expect(planIssue("Change the authentication flow").humanApprovalRequired).toBe(true);
  });
});
