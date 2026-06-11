export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "unknown";

export interface ProjectCommands {
  install: string;
  build: string;
  test: string;
  lint: string;
  format: string;
}

export interface ProjectInfo {
  rootDir: string;
  projectName: string;
  defaultBranch: string;
  packageManager: PackageManager;
  languages: string[];
  directories: string[];
  commands: ProjectCommands;
}

export type IssueType = "bug" | "feature" | "docs" | "refactor" | "test" | "question";
export type Priority = "low" | "medium" | "high";
export type Difficulty = "easy" | "medium" | "hard";
export type Readiness = "ready" | "needs-human-clarification" | "blocked";

export interface TriageResult {
  summary: string;
  type: IssueType;
  suggestedLabels: string[];
  priority: Priority;
  difficulty: Difficulty;
  affectedAreas: string[];
  missingInformation: string[];
  suggestedNextAction: string;
  readiness: Readiness;
  humanApprovalRequired: boolean;
}

export interface ImplementationPlan {
  goal: string;
  currentUnderstanding: string;
  filesLikelyToChange: string[];
  proposedSteps: string[];
  tests: string[];
  risks: string[];
  humanApprovalRequired: boolean;
}

export interface InitResult {
  created: string[];
  overwritten: string[];
  skipped: string[];
}
