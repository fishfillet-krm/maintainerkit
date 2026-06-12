import { describe, expect, it } from "vitest";
import { triageIssue } from "../src/core/triageIssue.js";
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

describe("triageIssue", () => {
  it("classifies a crash as a bug", () => {
    expect(triageIssue("The app crashes when the config file is missing").type).toBe("bug");
  });

  it("falls back to question when no classification keyword matches", () => {
    expect(triageIssue("Please review the current behavior")).toMatchObject({
      type: "question",
      priority: "low",
    });
  });

  it("does not match short English keywords inside unrelated words", () => {
    const result = triageIssue(
      "The author biography needs a wording review with clear acceptance criteria.",
    );

    expect(result.humanApprovalRequired).toBe(false);
    expect(result.readiness).not.toBe("blocked");
  });

  it("supports issues containing multiple classification signals", () => {
    const result = triageIssue(
      "The CLI crashes when running tests. Steps to reproduce and environment: Node 20.",
    );

    expect(result.type).toBe("bug");
    expect(result.affectedAreas).toEqual(expect.arrayContaining(["CLI", "tests"]));
  });

  it("preserves Unicode text in summaries", () => {
    const result = triageIssue("設定画面で絵文字🚀を表示できるようにしたい");
    expect(result.summary).toContain("🚀");
    expect(result.type).toBe("feature");
  });

  it("truncates very long first lines", () => {
    const result = triageIssue(`Add support for ${"x".repeat(300)}`);
    expect(result.summary).toHaveLength(160);
    expect(result.summary.endsWith("...")).toBe(true);
  });

  it("classifies README work as docs", () => {
    expect(triageIssue("READMEのインストール手順を更新したい").type).toBe("docs");
  });

  it("classifies a feature request", () => {
    expect(triageIssue("CSV exportを追加してダウンロードできるようにしたい").type).toBe("feature");
  });

  it("classifies test work", () => {
    expect(triageIssue("Increase test coverage for the parser").type).toBe("test");
  });

  it("blocks protected security work for human approval", () => {
    const result = triageIssue(
      "認証ロジックを変更し、ログイン時のsecurity policyを更新する。Acceptance criteria are defined.",
    );

    expect(result.readiness).toBe("blocked");
    expect(result.humanApprovalRequired).toBe(true);
  });

  it("adds only repository directories relevant to affected areas", () => {
    const result = triageIssue("The CLI tests fail when config is missing", project);

    expect(result.affectedAreas).toEqual(
      expect.arrayContaining(["CLI", "tests", "src/", "tests/"]),
    );
    expect(result.affectedAreas).not.toContain("docs/");
  });

  it("uses the repository's singular test directory when present", () => {
    const result = triageIssue("Increase test coverage", {
      ...project,
      directories: ["src", "test"],
    });

    expect(result.affectedAreas).toContain("test/");
    expect(result.affectedAreas).not.toContain("tests/");
  });

  it("does not invent repository paths when project context is absent", () => {
    expect(triageIssue("Update the documentation").affectedAreas).toEqual(["documentation"]);
  });
});
