import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectProject } from "../src/core/detectProject.js";
import { makeTempDir, removeTempDirs } from "./helpers.js";

afterEach(removeTempDirs);

describe("detectProject", () => {
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
});
