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

function proposedSteps(type: ReturnType<typeof triageIssue>["type"]): string[] {
  const stepsByType = {
    bug: [
      "Reproduce the reported failure and identify the smallest responsible module.",
      "Confirm the expected behavior and the conditions that trigger the bug.",
      "Implement a focused fix without modifying unrelated behavior.",
      "Add a regression test that fails before the fix and passes afterward.",
      "Run the relevant test, lint, and build commands and update documentation if needed.",
    ],
    feature: [
      "Confirm the requested behavior, acceptance criteria, and compatibility constraints.",
      "Inspect the existing extension points and identify the smallest responsible module.",
      "Implement the feature without changing unrelated behavior.",
      "Add tests for the primary scenario and important boundaries.",
      "Run the relevant test, lint, and build commands and update user documentation.",
    ],
    docs: [
      "Identify the source of truth and the documentation that is outdated or incomplete.",
      "Confirm the intended audience, terminology, and supported workflow.",
      "Update only the relevant documentation and examples.",
      "Validate commands, links, and examples against the current implementation.",
      "Run documentation formatting or link checks and review the rendered result.",
    ],
    refactor: [
      "Document the current behavior and the specific maintainability problem.",
      "Identify the smallest internal boundary that can be improved safely.",
      "Refactor without changing the public API or observable behavior.",
      "Use existing tests to verify behavior preservation and add coverage only for exposed gaps.",
      "Run the full relevant test, lint, and build commands.",
    ],
    test: [
      "Identify the untested behavior and the nearest existing test pattern.",
      "Confirm the expected assertions and important boundary conditions.",
      "Add focused tests without changing production behavior unless a defect is discovered.",
      "Verify that the new test fails for the intended reason when applicable.",
      "Run the targeted tests and the existing suite to check for regressions.",
    ],
    question: [
      "Clarify the exact question and the decision it is intended to support.",
      "Inspect the current implementation and authoritative project documentation.",
      "Record the answer with concrete file, command, or behavior references.",
      "Identify any ambiguity that still requires maintainer confirmation.",
      "Update documentation or tests only if the investigation reveals a durable gap.",
    ],
  } satisfies Record<ReturnType<typeof triageIssue>["type"], string[]>;

  return stepsByType[type];
}

function plannedTests(type: ReturnType<typeof triageIssue>["type"]): string[] {
  const testsByType = {
    bug: [
      "Add a regression test for the reported failure.",
      "Add a boundary test for the nearest related failure mode.",
      "Run the existing test suite to check for regressions.",
    ],
    feature: [
      "Add coverage for the primary feature scenario.",
      "Add a boundary or compatibility test for the new behavior.",
      "Run the existing test suite to check for regressions.",
    ],
    docs: [
      "Validate documented commands and examples against the current implementation.",
      "Run available formatting, link, or documentation checks.",
      "Review the rendered documentation for clarity and broken references.",
    ],
    refactor: [
      "Run existing tests that cover the refactored behavior.",
      "Add focused coverage only for behavior that was previously unprotected.",
      "Run the broader suite to confirm observable behavior is unchanged.",
    ],
    test: [
      "Run the new focused tests and confirm their assertions are meaningful.",
      "Check relevant boundary cases and failure messages.",
      "Run the existing test suite to check for regressions.",
    ],
    question: [
      "Reproduce any referenced behavior or command where practical.",
      "Cross-check the conclusion against existing tests and documentation.",
      "Add a test only if the investigation exposes an unverified contract.",
    ],
  } satisfies Record<ReturnType<typeof triageIssue>["type"], string[]>;

  return testsByType[type];
}

export function planIssue(issue: string, project?: ProjectInfo): ImplementationPlan {
  const triage = triageIssue(issue);
  const protectedRisk =
    "Changes in protected areas can affect security, access, releases, deployments, or billing.";

  return {
    goal: triage.summary,
    currentUnderstanding: `This issue is classified as ${triage.type} with ${triage.difficulty} difficulty and ${triage.priority} priority. Affected areas: ${triage.affectedAreas.join(", ")}.`,
    filesLikelyToChange: likelyFiles(triage.type, project),
    proposedSteps: proposedSteps(triage.type),
    tests: plannedTests(triage.type),
    risks: [
      triage.humanApprovalRequired
        ? protectedRisk
        : "The issue may omit constraints that are only visible in the existing implementation.",
      "Likely files are estimates and must be verified against the repository before editing.",
    ],
    humanApprovalRequired: triage.humanApprovalRequired,
  };
}
