import { detectProject } from "../core/detectProject.js";
import { generateFiles } from "../core/generateFiles.js";

export async function runInit(options: { force?: boolean; cwd?: string }): Promise<void> {
  const project = await detectProject(options.cwd);
  const result = await generateFiles(project, { force: options.force });

  for (const file of result.created) console.log(`created ${file}`);
  for (const file of result.overwritten) console.log(`overwritten ${file}`);
  for (const file of result.skipped) console.log(`skipped ${file} (already exists)`);
  console.log(
    `summary: ${result.created.length} created, ${result.overwritten.length} overwritten, ${result.skipped.length} skipped`,
  );
}
