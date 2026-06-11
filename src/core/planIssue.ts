import type { ImplementationPlan, ProjectInfo } from "../types.js";
import { triageIssue } from "./triageIssue.js";

function likelyFiles(
  type: ReturnType<typeof triageIssue>["type"],
  project?: ProjectInfo,
): string[] {
  const candidates: string[] = [];
  const sourceDirectory = project?.directories.includes("src")
    ? "src/"
    : "application source files";
  const testDirectory = project?.directories.includes("tests")
    ? "tests/"
    : project?.directories.includes("test")
      ? "test/"
      : "relevant test files";

  if (type === "docs") return ["README.md or relevant files under docs/"];
  if (type === "test") return [testDirectory];
  candidates.push(sourceDirectory);
  candidates.push(testDirectory);
  if (type === "feature") candidates.push("README.md or relevant user documentation");
  return candidates;
}

export function planIssue(issue: string, project?: ProjectInfo): ImplementationPlan {
  const triage = triageIssue(issue);
  const protectedRisk =
    "Changes in protected areas can affect security, access, releases, deployments, or billing.";

  return {
    goal: triage.summary,
    currentUnderstanding: `This issue is classified as ${triage.type} with ${triage.difficulty} difficulty and ${triage.priority} priority. Affected areas: ${triage.affectedAreas.join(", ")}.`,
    filesLikelyToChange: likelyFiles(triage.type, project),
    proposedSteps: [
      "Inspect the current behavior and identify the smallest responsible module.",
      "Confirm the expected behavior and any missing acceptance criteria.",
      "Implement a focused change without modifying unrelated behavior.",
      "Add or update tests that demonstrate the requested behavior.",
      "Run the relevant test, lint, and build commands and update documentation if needed.",
    ],
    tests: [
      `Add coverage for the primary ${triage.type} scenario.`,
      "Add a regression or boundary test for the nearest failure mode.",
      "Run the existing test suite to check for regressions.",
    ],
    risks: [
      triage.humanApprovalRequired
        ? protectedRisk
        : "The issue may omit constraints that are only visible in the existing implementation.",
      "Likely files are estimates and must be verified against the repository before editing.",
    ],
    humanApprovalRequired: triage.humanApprovalRequired,
  };
}
