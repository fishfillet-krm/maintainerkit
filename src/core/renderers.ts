import type { ImplementationPlan, TriageResult } from "../types.js";
import { bulletList, heading, numberedList } from "../utils/markdown.js";

export function renderTriage(result: TriageResult): string {
  return [
    "# Triage Result",
    "",
    heading("Summary"),
    result.summary,
    "",
    heading("Type"),
    result.type,
    "",
    heading("Suggested Labels"),
    bulletList(result.suggestedLabels),
    "",
    heading("Priority"),
    result.priority,
    "",
    heading("Difficulty"),
    result.difficulty,
    "",
    heading("Affected Area"),
    bulletList(result.affectedAreas),
    "",
    heading("Missing Information"),
    result.missingInformation.length > 0
      ? bulletList(result.missingInformation)
      : "None identified.",
    "",
    heading("Suggested Next Action"),
    result.suggestedNextAction,
    "",
    heading("Codex Readiness"),
    result.readiness,
  ].join("\n");
}

export function renderPlan(plan: ImplementationPlan): string {
  return [
    "# Implementation Plan",
    "",
    heading("Goal"),
    plan.goal,
    "",
    heading("Current Understanding"),
    plan.currentUnderstanding,
    "",
    heading("Files Likely to Change"),
    bulletList(plan.filesLikelyToChange),
    "",
    heading("Proposed Steps"),
    numberedList(plan.proposedSteps),
    "",
    heading("Tests to Add or Update"),
    bulletList(plan.tests),
    "",
    heading("Risks"),
    bulletList(plan.risks),
    "",
    heading("Human Approval Required?"),
    plan.humanApprovalRequired ? "yes" : "no",
    "",
    heading("Pre-PR Checklist"),
    [
      "- [ ] Small, focused change",
      "- [ ] Tests added or updated",
      "- [ ] Existing tests pass",
      "- [ ] Documentation updated if needed",
      "- [ ] No unrelated formatting changes",
    ].join("\n"),
  ].join("\n");
}
