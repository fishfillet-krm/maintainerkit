import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { InitResult, ProjectInfo } from "../types.js";
import { generatedFiles } from "./templates.js";

export async function generateFiles(
  project: ProjectInfo,
  options: { force?: boolean } = {},
): Promise<InitResult> {
  const result: InitResult = { created: [], overwritten: [], skipped: [] };

  for (const [relativePath, content] of Object.entries(generatedFiles(project))) {
    const target = path.join(project.rootDir, relativePath);
    await mkdir(path.dirname(target), { recursive: true });

    let existed = false;
    try {
      await access(target);
      existed = true;
    } catch {
      existed = false;
    }

    try {
      await writeFile(target, content, { encoding: "utf8", flag: options.force ? "w" : "wx" });
      (existed ? result.overwritten : result.created).push(relativePath);
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
      if (code === "EEXIST" && !options.force) {
        result.skipped.push(relativePath);
        continue;
      }
      throw error;
    }
  }

  return result;
}
