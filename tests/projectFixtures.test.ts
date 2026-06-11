import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectProject } from "../src/core/detectProject.js";
import { generateFiles } from "../src/core/generateFiles.js";
import { makeTempDir, removeTempDirs } from "./helpers.js";

afterEach(removeTempDirs);

interface Fixture {
  name: string;
  files: Record<string, string>;
  packageManager: string;
  languages: string[];
  directories?: string[];
}

const fixtures: Fixture[] = [
  {
    name: "typescript-npm",
    files: {
      "package.json": JSON.stringify({
        name: "typescript-npm",
        scripts: { build: "tsc", test: "vitest run" },
      }),
      "package-lock.json": "{}",
      "tsconfig.json": "{}",
      "src/index.ts": "export {};\n",
    },
    packageManager: "npm",
    languages: ["TypeScript"],
    directories: ["src"],
  },
  {
    name: "typescript-pnpm",
    files: {
      "package.json": JSON.stringify({
        name: "typescript-pnpm",
        packageManager: "pnpm@10.34.2",
        scripts: { lint: "eslint ." },
      }),
      "pnpm-lock.yaml": "lockfileVersion: '9.0'\n",
      "src/index.ts": "export {};\n",
    },
    packageManager: "pnpm",
    languages: ["TypeScript"],
  },
  {
    name: "python",
    files: {
      "pyproject.toml": '[project]\nname = "python-fixture"\n',
      "src/python_fixture/__init__.py": "",
      "tests/test_fixture.py": "def test_fixture():\n    assert True\n",
    },
    packageManager: "unknown",
    languages: ["Python"],
    directories: ["src", "tests"],
  },
  {
    name: "rust",
    files: {
      "Cargo.toml": '[package]\nname = "rust-fixture"\nversion = "0.1.0"\n',
      "src/main.rs": "fn main() {}\n",
    },
    packageManager: "unknown",
    languages: ["Rust"],
  },
  {
    name: "go",
    files: {
      "go.mod": "module example.com/go-fixture\n\ngo 1.23\n",
      "main.go": "package main\nfunc main() {}\n",
    },
    packageManager: "unknown",
    languages: ["Go"],
  },
  {
    name: "monorepo",
    files: {
      "package.json": JSON.stringify({
        name: "monorepo",
        packageManager: "pnpm@10.34.2",
        scripts: { test: "pnpm -r test" },
      }),
      "pnpm-lock.yaml": "lockfileVersion: '9.0'\n",
      "pnpm-workspace.yaml": "packages:\n  - packages/*\n",
      "packages/app/src/index.ts": "export {};\n",
      "src/index.ts": "export {};\n",
    },
    packageManager: "pnpm",
    languages: ["TypeScript"],
  },
];

async function writeFixture(root: string, files: Record<string, string>): Promise<void> {
  for (const [relativePath, content] of Object.entries(files)) {
    const target = path.join(root, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content);
  }
}

describe("representative project fixtures", () => {
  it.each(fixtures)("detects and initializes $name", async (fixture) => {
    const root = await makeTempDir();
    await writeFixture(root, fixture.files);

    const project = await detectProject(root);
    expect(project.packageManager).toBe(fixture.packageManager);
    expect(project.languages).toEqual(expect.arrayContaining(fixture.languages));
    if (fixture.directories) {
      expect(project.directories).toEqual(expect.arrayContaining(fixture.directories));
    }

    const first = await generateFiles(project);
    const second = await generateFiles(project);
    expect(first.created).toContain("AGENTS.md");
    expect(second.skipped).toHaveLength(first.created.length);
    expect(second.created).toHaveLength(0);
  });
});
