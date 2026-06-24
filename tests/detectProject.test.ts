import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";
import { detectProject } from "../src/core/detectProject.js";
import { makeTempDir, removeTempDirs } from "./helpers.js";

afterEach(removeTempDirs);

const execFileAsync = promisify(execFile);

describe("detectProject", () => {
  it("handles an empty repository", async () => {
    const root = await makeTempDir();

    await expect(detectProject(root)).resolves.toMatchObject({
      packageManager: "unknown",
      defaultBranch: "unknown",
      languages: [],
      directories: [],
      commands: {
        install: "",
        build: "",
        test: "",
        lint: "",
        format: "",
      },
    });
  });

  it("handles malformed package.json conservatively", async () => {
    const root = await makeTempDir();
    await writeFile(path.join(root, "package.json"), "{ invalid json");

    await expect(detectProject(root)).resolves.toMatchObject({
      projectName: path.basename(root),
      packageManager: "unknown",
    });
  });

  it("detects package manager, scripts, language, and directories", async () => {
    const root = await makeTempDir();
    await mkdir(path.join(root, "src"));
    await mkdir(path.join(root, "tests"));
    await writeFile(path.join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
    await writeFile(path.join(root, "tsconfig.json"), "{}\n");
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({
        name: "fixture",
        scripts: { build: "tsc", test: "vitest", lint: "eslint ." },
      }),
    );

    const project = await detectProject(root);

    expect(project.projectName).toBe("fixture");
    expect(project.packageManager).toBe("pnpm");
    expect(project.languages).toContain("TypeScript");
    expect(project.directories).toEqual(["src", "tests"]);
    expect(project.commands).toMatchObject({
      install: "pnpm install",
      build: "pnpm build",
      test: "pnpm test",
      lint: "pnpm lint",
      format: "",
    });
  });

  it.each([
    ["npm", "package-lock.json"],
    ["pnpm", "pnpm-lock.yaml"],
    ["yarn", "yarn.lock"],
    ["bun", "bun.lock"],
  ] as const)("detects the %s lockfile", async (expected, lockfile) => {
    const root = await makeTempDir();
    await writeFile(path.join(root, lockfile), "");
    await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "fixture" }));

    expect((await detectProject(root)).packageManager).toBe(expected);
  });

  it.each([
    ["TypeScript", "tsconfig.json"],
    ["Python", "pyproject.toml"],
    ["Rust", "Cargo.toml"],
    ["Go", "go.mod"],
  ] as const)("detects %s from %s", async (expected, marker) => {
    const root = await makeTempDir();
    await writeFile(path.join(root, marker), "");

    expect((await detectProject(root)).languages).toContain(expected);
  });

  it("prefers the packageManager declaration over lockfiles", async () => {
    const root = await makeTempDir();
    await writeFile(path.join(root, "package-lock.json"), "{}");
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ name: "fixture", packageManager: "yarn@4.9.1" }),
    );

    expect((await detectProject(root)).packageManager).toBe("yarn");
  });

  it("infers Python commands only from configured tools", async () => {
    const root = await makeTempDir();
    await writeFile(
      path.join(root, "pyproject.toml"),
      [
        "[build-system]",
        'requires = ["hatchling"]',
        "",
        "[project]",
        'name = "fixture"',
        'dependencies = ["pytest"]',
        "",
        "[tool.pytest.ini_options]",
        'testpaths = ["tests"]',
        "",
        "[tool.ruff]",
        'target-version = "py311"',
        "",
        "[tool.ruff.format]",
        'quote-style = "double"',
      ].join("\n"),
    );
    await writeFile(path.join(root, "uv.lock"), "");

    expect((await detectProject(root)).commands).toEqual({
      install: "uv sync",
      build: "python -m build",
      test: "python -m pytest",
      lint: "ruff check .",
      format: "ruff format .",
    });
  });

  it("keeps ambiguous Python commands blank", async () => {
    const root = await makeTempDir();
    await writeFile(path.join(root, "pyproject.toml"), "[tool.coverage.run]\nbranch = true\n");

    expect((await detectProject(root)).commands).toEqual({
      install: "",
      build: "",
      test: "",
      lint: "",
      format: "",
    });
  });

  it("infers Cargo commands for Rust repositories", async () => {
    const root = await makeTempDir();
    await writeFile(path.join(root, "Cargo.toml"), '[package]\nname = "fixture"\n');

    expect((await detectProject(root)).commands).toEqual({
      install: "cargo fetch",
      build: "cargo build",
      test: "cargo test",
      lint: "cargo clippy --all-targets --all-features",
      format: "cargo fmt --all",
    });
  });

  it("infers Go commands and requires explicit lint configuration", async () => {
    const root = await makeTempDir();
    await writeFile(path.join(root, "go.mod"), "module example.com/fixture\n\ngo 1.23\n");
    await writeFile(path.join(root, ".golangci.yml"), "linters:\n  enable:\n    - govet\n");

    expect((await detectProject(root)).commands).toEqual({
      install: "go mod download",
      build: "go build ./...",
      test: "go test ./...",
      lint: "golangci-lint run",
      format: "",
    });
  });

  it("does not replace configured Node scripts with language defaults", async () => {
    const root = await makeTempDir();
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({
        scripts: {
          build: "custom-build",
          test: "custom-test",
        },
      }),
    );
    await writeFile(path.join(root, "Cargo.toml"), '[package]\nname = "fixture"\n');

    expect((await detectProject(root)).commands).toMatchObject({
      build: "npm run build",
      test: "npm run test",
      lint: "cargo clippy --all-targets --all-features",
    });
  });

  it("detects the default branch from origin/HEAD", async () => {
    const root = await makeTempDir();
    await execFileAsync("git", ["init"], { cwd: root });
    await execFileAsync(
      "git",
      ["symbolic-ref", "refs/remotes/origin/HEAD", "refs/remotes/origin/stable"],
      { cwd: root },
    );

    expect((await detectProject(root)).defaultBranch).toBe("stable");
  });

  it("does not mistake the current branch for the default branch", async () => {
    const root = await makeTempDir();
    await execFileAsync("git", ["init", "-b", "temporary-work"], { cwd: root });

    expect((await detectProject(root)).defaultBranch).toBe("unknown");
  });
});
