import { execFile } from "node:child_process";
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

async function readTextFile(rootDir: string, filename: string): Promise<string | undefined> {
  try {
    return await readFile(path.join(rootDir, filename), "utf8");
  } catch {
    return undefined;
  }
}

async function gitOutput(rootDir: string, args: string[]): Promise<string | undefined> {
  return new Promise((resolve) => {
    execFile("git", args, { cwd: rootDir, encoding: "utf8" }, (error, stdout) => {
      resolve(error ? undefined : stdout.trim());
    });
  });
}

async function detectDefaultBranch(rootDir: string): Promise<string> {
  const remoteHead = await gitOutput(rootDir, [
    "symbolic-ref",
    "--quiet",
    "--short",
    "refs/remotes/origin/HEAD",
  ]);
  if (!remoteHead?.startsWith("origin/")) return "unknown";

  const branch = remoteHead.slice("origin/".length);
  return branch || "unknown";
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

function hasTomlSection(content: string, section: string): boolean {
  return content
    .split(/\r?\n/)
    .some((line) => line.trim().toLowerCase() === `[${section.toLowerCase()}]`);
}

function mergeCommands(primary: ProjectCommands, fallback: ProjectCommands): ProjectCommands {
  return {
    install: primary.install || fallback.install,
    build: primary.build || fallback.build,
    test: primary.test || fallback.test,
    lint: primary.lint || fallback.lint,
    format: primary.format || fallback.format,
  };
}

function pythonCommands(pyproject: string, entries: string[]): ProjectCommands {
  const hasProject = hasTomlSection(pyproject, "project");
  const hasBuildSystem = hasTomlSection(pyproject, "build-system");
  const usesPytest = hasTomlSection(pyproject, "tool.pytest.ini_options");
  const usesRuff = hasTomlSection(pyproject, "tool.ruff");
  const usesRuffFormat = hasTomlSection(pyproject, "tool.ruff.format");
  const usesBlack = hasTomlSection(pyproject, "tool.black");

  let install = hasProject ? "python -m pip install -e ." : "";
  if (entries.includes("uv.lock")) install = "uv sync";
  if (entries.includes("poetry.lock") || hasTomlSection(pyproject, "tool.poetry")) {
    install = "poetry install";
  }
  if (entries.includes("pdm.lock") || hasTomlSection(pyproject, "tool.pdm")) {
    install = "pdm install";
  }

  return {
    install,
    build: hasBuildSystem ? "python -m build" : "",
    test: usesPytest ? "python -m pytest" : "",
    lint: usesRuff ? "ruff check ." : "",
    format: usesRuffFormat ? "ruff format ." : usesBlack ? "black ." : "",
  };
}

function rustCommands(): ProjectCommands {
  return {
    install: "cargo fetch",
    build: "cargo build",
    test: "cargo test",
    lint: "cargo clippy --all-targets --all-features",
    format: "cargo fmt --all",
  };
}

function goCommands(entries: string[]): ProjectCommands {
  const hasGolangciConfig = entries.some((entry) =>
    /^\.golangci\.(?:ya?ml|toml|json)$/.test(entry),
  );

  return {
    install: "go mod download",
    build: "go build ./...",
    test: "go test ./...",
    lint: hasGolangciConfig ? "golangci-lint run" : "",
    format: "",
  };
}

async function detectNonNodeCommands(rootDir: string, entries: string[]): Promise<ProjectCommands> {
  let commands: ProjectCommands = {
    install: "",
    build: "",
    test: "",
    lint: "",
    format: "",
  };

  const pyproject = await readTextFile(rootDir, "pyproject.toml");
  if (pyproject !== undefined) {
    commands = mergeCommands(commands, pythonCommands(pyproject, entries));
  }
  if (entries.includes("Cargo.toml")) {
    commands = mergeCommands(commands, rustCommands());
  }
  if (entries.includes("go.mod")) {
    commands = mergeCommands(commands, goCommands(entries));
  }

  return commands;
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
  const nodeCommands = buildCommands(packageManager, packageJson?.scripts);
  const nonNodeCommands = await detectNonNodeCommands(resolvedRoot, entries);
  const defaultBranch = await detectDefaultBranch(resolvedRoot);

  return {
    rootDir: resolvedRoot,
    projectName: packageJson?.name ?? path.basename(resolvedRoot),
    defaultBranch,
    packageManager,
    languages,
    directories,
    commands: mergeCommands(nodeCommands, nonNodeCommands),
  };
}
