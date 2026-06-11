import { writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readIssueInput } from "../src/utils/fs.js";
import { makeTempDir, removeTempDirs } from "./helpers.js";

afterEach(removeTempDirs);

describe("readIssueInput", () => {
  it("accepts text input", async () => {
    await expect(readIssueInput({ text: "Issue text" })).resolves.toBe("Issue text");
  });

  it("reads a file", async () => {
    const root = await makeTempDir();
    await writeFile(path.join(root, "issue.md"), "File issue\n");
    await expect(readIssueInput({ file: "issue.md", cwd: root })).resolves.toBe("File issue");
  });

  it("rejects missing, duplicate, and empty input", async () => {
    await expect(readIssueInput({})).rejects.toThrow("exactly one");
    await expect(readIssueInput({ text: "x", file: "x.md" })).rejects.toThrow("exactly one");
    await expect(readIssueInput({ text: "  " })).rejects.toThrow("must not be empty");
  });

  it("reports an unreadable input file", async () => {
    const root = await makeTempDir();
    await expect(readIssueInput({ file: "missing.md", cwd: root })).rejects.toThrow(
      "Could not read issue file",
    );
  });
});
