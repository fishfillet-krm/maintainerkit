import { detectProject } from "../core/detectProject.js";
import { createTriagePrompt } from "../core/prompts.js";
import { renderTriage } from "../core/renderers.js";
import { triageIssue } from "../core/triageIssue.js";
import { readIssueInput } from "../utils/fs.js";

export async function runTriage(options: {
  text?: string;
  file?: string;
  promptOnly?: boolean;
  cwd?: string;
}): Promise<void> {
  const issue = await readIssueInput(options);
  if (options.promptOnly) {
    console.log(createTriagePrompt(issue));
    return;
  }
  const project = await detectProject(options.cwd);
  console.log(renderTriage(triageIssue(issue, project)));
}
