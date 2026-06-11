import type { Difficulty, IssueType, Priority, Readiness, TriageResult } from "../types.js";

const typeKeywords: Record<IssueType, string[]> = {
  bug: [
    "bug",
    "crash",
    "crashes",
    "crashed",
    "crashing",
    "error",
    "exception",
    "broken",
    "fail",
    "fails",
    "failed",
    "failing",
    "クラッシュ",
    "落ちる",
    "エラー",
    "例外",
    "不具合",
    "動かない",
  ],
  feature: [
    "feature",
    "add",
    "support",
    "request",
    "enhancement",
    "欲しい",
    "追加",
    "対応",
    "できるように",
    "機能",
  ],
  docs: ["readme", "docs", "documentation", "guide", "説明", "文書", "ドキュメント", "手順"],
  refactor: ["refactor", "cleanup", "restructure", "リファクタ", "整理", "構造改善"],
  test: ["test", "coverage", "spec", "テスト", "カバレッジ"],
  question: ["question", "how", "why", "質問", "どうすれば", "なぜ"],
};

const protectedKeywords = [
  "authentication",
  "authorization",
  "auth",
  "security",
  "billing",
  "payment",
  "deployment",
  "release",
  "認証",
  "認可",
  "セキュリティ",
  "課金",
  "決済",
  "デプロイ",
  "リリース",
];

const highPriorityKeywords = [
  "crash",
  "data loss",
  "vulnerability",
  "production",
  "クラッシュ",
  "データ消失",
  "脆弱性",
  "本番",
];

const hardKeywords = [
  ...protectedKeywords,
  "migration",
  "architecture",
  "breaking",
  "database",
  "マイグレーション",
  "アーキテクチャ",
  "破壊的",
  "データベース",
];

function includesKeyword(input: string, keyword: string): boolean {
  const normalizedKeyword = keyword.toLowerCase();
  if (!/^[a-z0-9 ]+$/.test(normalizedKeyword)) {
    return input.includes(normalizedKeyword);
  }

  const escaped = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`, "i").test(input);
}

function scoreTypes(input: string): Record<IssueType, number> {
  return Object.fromEntries(
    Object.entries(typeKeywords).map(([type, keywords]) => [
      type,
      keywords.reduce((score, keyword) => score + (includesKeyword(input, keyword) ? 1 : 0), 0),
    ]),
  ) as Record<IssueType, number>;
}

function classifyType(input: string): IssueType {
  const scores = scoreTypes(input);
  if (Object.values(scores).every((score) => score === 0)) return "question";
  const precedence: IssueType[] = ["bug", "docs", "feature", "test", "refactor", "question"];
  return precedence.reduce((best, current) => (scores[current] > scores[best] ? current : best));
}

function summarize(issue: string): string {
  const firstLine = issue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  const summary = firstLine ?? issue.trim();
  return summary.length > 160 ? `${summary.slice(0, 157)}...` : summary;
}

function detectAffectedAreas(input: string, type: IssueType): string[] {
  const areas = new Set<string>();
  if (/(readme|docs|documentation|説明|文書|ドキュメント)/i.test(input)) areas.add("documentation");
  if (/(test|coverage|spec|テスト|カバレッジ)/i.test(input)) areas.add("tests");
  if (/(cli|command|argument|flag|コマンド|引数|オプション)/i.test(input)) areas.add("CLI");
  if (/(config|configuration|設定)/i.test(input)) areas.add("configuration");
  if (protectedKeywords.some((keyword) => includesKeyword(input, keyword)))
    areas.add("protected area");
  if (areas.size === 0) areas.add(type === "docs" ? "documentation" : "application code");
  return [...areas];
}

function assessMissingInformation(issue: string, type: IssueType): string[] {
  const missing: string[] = [];
  const hasStructuredDetail = issue.includes("\n") || issue.length >= 100;
  if (!hasStructuredDetail) missing.push("Expected behavior and acceptance criteria");
  if (type === "bug" && !/(reproduce|steps|when|再現|手順|場合)/i.test(issue)) {
    missing.push("Reproduction steps");
  }
  if (type === "bug" && !/(version|environment|os|node|バージョン|環境)/i.test(issue)) {
    missing.push("Environment and version information");
  }
  return missing;
}

export function triageIssue(issue: string): TriageResult {
  const normalized = issue.toLowerCase();
  const type = classifyType(normalized);
  const humanApprovalRequired = protectedKeywords.some((keyword) =>
    includesKeyword(normalized, keyword),
  );
  const missingInformation = assessMissingInformation(issue, type);

  let priority: Priority = "medium";
  if (highPriorityKeywords.some((keyword) => includesKeyword(normalized, keyword))) {
    priority = "high";
  } else if (type === "docs" || type === "question") {
    priority = "low";
  }

  let difficulty: Difficulty = "medium";
  if (hardKeywords.some((keyword) => includesKeyword(normalized, keyword))) {
    difficulty = "hard";
  } else if (type === "docs" || (issue.length < 100 && type !== "bug")) {
    difficulty = "easy";
  }

  let readiness: Readiness = "ready";
  if (humanApprovalRequired) {
    readiness = "blocked";
  } else if (missingInformation.length > 0) {
    readiness = "needs-human-clarification";
  }

  const labels = new Set<string>([type]);
  if (type === "bug" || type === "feature") labels.add("needs-test");
  labels.add(readiness === "ready" ? "codex-ready" : "needs-triage");

  return {
    summary: summarize(issue),
    type,
    suggestedLabels: [...labels],
    priority,
    difficulty,
    affectedAreas: detectAffectedAreas(normalized, type),
    missingInformation,
    suggestedNextAction:
      readiness === "blocked"
        ? "Ask a human maintainer to approve the protected-area changes and clarify constraints."
        : readiness === "needs-human-clarification"
          ? "Request the missing information before implementation planning."
          : "Generate an implementation plan and validate it with the maintainer.",
    readiness,
    humanApprovalRequired,
  };
}
