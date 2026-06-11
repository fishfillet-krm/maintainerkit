import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { detectProject } from "../src/core/detectProject.js";
import { generateFiles } from "../src/core/generateFiles.js";
import { makeTempDir, removeTempDirs } from "./helpers.js";

afterEach(removeTempDirs);

describe("generateFiles", () => {
  it("creates the required maintenance files", async () => {
    const root = await makeTempDir();
    const result = await generateFiles(await detectProject(root));

    expect(result.created).toContain("AGENTS.md");
    expect(result.created).toContain(".maintainerkit/config.json");
    expect(result.created).toContain(".github/PULL_REQUEST_TEMPLATE.md");
  });

  it("does not overwrite existing files by default", async () => {
    const root = await makeTempDir();
    await writeFile(path.join(root, "AGENTS.md"), "keep me");

    const result = await generateFiles(await detectProject(root));

    expect(result.skipped).toContain("AGENTS.md");
    expect(await readFile(path.join(root, "AGENTS.md"), "utf8")).toBe("keep me");
  });

  it("overwrites existing files with force", async () => {
    const root = await makeTempDir();
    await writeFile(path.join(root, "AGENTS.md"), "replace me");

    const result = await generateFiles(await detectProject(root), { force: true });

    expect(result.overwritten).toContain("AGENTS.md");
    expect(await readFile(path.join(root, "AGENTS.md"), "utf8")).toContain("# AGENTS.md");
  });
});
