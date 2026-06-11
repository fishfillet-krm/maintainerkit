import { detectProject } from "../core/detectProject.js";
import { planIssue } from "../core/planIssue.js";
import { createPlanPrompt } from "../core/prompts.js";
import { renderPlan } from "../core/renderers.js";
import { readIssueInput } from "../utils/fs.js";

export async function runPlan(options: {
  text?: string;
  file?: string;
  promptOnly?: boolean;
  cwd?: string;
}): Promise<void> {
  const issue = await readIssueInput(options);
  if (options.promptOnly) {
    console.log(createPlanPrompt(issue));
    return;
  }
  const project = await detectProject(options.cwd);
  console.log(renderPlan(planIssue(issue, project)));
}
