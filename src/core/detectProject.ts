import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { PackageManager, ProjectCommands, ProjectInfo } from "../types.js";

interface PackageJson {
  name?: string;
  packageManager?: string;
  scripts?: Record<string, string>;
}

const directoryCandidates = ["src", "test", "tests", "docs", ".github"];

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readPackageJson(rootDir: string): Promise<PackageJson | undefined> {
  try {
    const content = await readFile(path.join(rootDir, "package.json"), "utf8");
    return JSON.parse(content) as PackageJson;
  } catch {
    return undefined;
  }
}

async function detectPackageManager(
  rootDir: string,
  packageJson?: PackageJson,
): Promise<PackageManager> {
  const declared = packageJson?.packageManager?.split("@")[0];
  if (declared === "npm" || declared === "pnpm" || declared === "yarn" || declared === "bun") {
    return declared;
  }

  const lockfiles: Array<[string, PackageManager]> = [
    ["pnpm-lock.yaml", "pnpm"],
    ["yarn.lock", "yarn"],
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["package-lock.json", "npm"],
  ];
  for (const [lockfile, manager] of lockfiles) {
    if (await exists(path.join(rootDir, lockfile))) return manager;
  }
  return packageJson ? "npm" : "unknown";
}

function commandFor(
  manager: PackageManager,
  script: string,
  scripts: Record<string, string>,
): string {
  if (!scripts[script]) return "";
  if (manager === "npm") return `npm run ${script}`;
  if (manager === "unknown") return `npm run ${script}`;
  return `${manager} ${script}`;
}

function buildCommands(
  manager: PackageManager,
  scripts: Record<string, string> = {},
): ProjectCommands {
  return {
    install: manager === "unknown" ? "" : `${manager} install`,
    build: commandFor(manager, "build", scripts),
    test: commandFor(manager, "test", scripts),
    lint: commandFor(manager, "lint", scripts),
    format: commandFor(manager, "format", scripts),
  };
}

async function detectLanguages(rootDir: string, entries: string[]): Promise<string[]> {
  const checks: Array<[string, boolean]> = [
    ["TypeScript", entries.some((entry) => entry.endsWith(".ts") || entry === "tsconfig.json")],
    [
      "JavaScript",
      entries.some(
        (entry) => entry.endsWith(".js") || entry.endsWith(".mjs") || entry.endsWith(".cjs"),
      ),
    ],
    ["Python", entries.some((entry) => entry.endsWith(".py") || entry === "pyproject.toml")],
    ["Rust", entries.includes("Cargo.toml")],
    ["Go", entries.includes("go.mod")],
  ];

  if (entries.includes("src")) {
    try {
      const sourceEntries = await readdir(path.join(rootDir, "src"), { recursive: true });
      checks[0]![1] ||= sourceEntries.some((entry) => String(entry).endsWith(".ts"));
      checks[1]![1] ||= sourceEntries.some((entry) => /\.(?:js|mjs|cjs)$/.test(String(entry)));
      checks[2]![1] ||= sourceEntries.some((entry) => String(entry).endsWith(".py"));
    } catch {
      // The top-level signals are still useful if the source tree cannot be read.
    }
  }

  return checks.filter(([, present]) => present).map(([language]) => language);
}

export async function detectProject(rootDir = process.cwd()): Promise<ProjectInfo> {
  const resolvedRoot = path.resolve(rootDir);
  const entries = await readdir(resolvedRoot);
  const packageJson = await readPackageJson(resolvedRoot);
  const packageManager = await detectPackageManager(resolvedRoot, packageJson);
  const directories = directoryCandidates.filter((candidate) => entries.includes(candidate));
  const languages = await detectLanguages(resolvedRoot, entries);

  return {
    rootDir: resolvedRoot,
    projectName: packageJson?.name ?? path.basename(resolvedRoot),
    defaultBranch: "main",
    packageManager,
    languages,
    directories,
    commands: buildCommands(packageManager, packageJson?.scripts),
  };
}
