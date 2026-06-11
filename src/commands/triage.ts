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
  console.log(options.promptOnly ? createTriagePrompt(issue) : renderTriage(triageIssue(issue)));
}
