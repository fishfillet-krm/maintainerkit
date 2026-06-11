import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { detectProject } from "../src/core/detectProject.js";
import { generatedFiles } from "../src/core/templates.js";

const root = path.resolve(import.meta.dirname, "..");

describe("MaintainerKit dogfooding", () => {
  it("detects its own stack and commands", async () => {
    const project = await detectProject(root);
    expect(project).toMatchObject({
      projectName: "maintainerkit",
      packageManager: "pnpm",
      languages: expect.arrayContaining(["TypeScript"]),
      directories: expect.arrayContaining(["src", "tests", "docs", ".github"]),
      commands: {
        install: "pnpm install",
        build: "pnpm build",
        test: "pnpm test",
        lint: "pnpm lint",
        format: "pnpm format",
      },
    });
  });

  it("keeps checked-in safety settings aligned with generated defaults", async () => {
    const project = await detectProject(root);
    const expected = JSON.parse(generatedFiles(project)[".maintainerkit/config.json"]);
    const checkedIn = JSON.parse(
      await readFile(path.join(root, ".maintainerkit", "config.json"), "utf8"),
    );

    expect(checkedIn.agent).toEqual(expected.agent);
    expect(checkedIn.packageManager).toBe(expected.packageManager);
  });
});
