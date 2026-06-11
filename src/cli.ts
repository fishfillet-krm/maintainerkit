import { Command } from "commander";
import { createRequire } from "node:module";
import { runInit } from "./commands/init.js";
import { runPlan } from "./commands/plan.js";
import { runTriage } from "./commands/triage.js";

interface PackageMetadata {
  version: string;
}

const require = createRequire(import.meta.url);
const packageMetadata = require("../package.json") as PackageMetadata;

export function createProgram(): Command {
  const program = new Command()
    .name("maintainerkit")
    .description("Prepare repositories for safe AI-assisted maintenance.")
    .version(packageMetadata.version)
    .showSuggestionAfterError();

  program
    .command("init")
    .description("Generate repository maintenance files without overwriting existing files.")
    .option("--force", "overwrite existing generated files")
    .action(async (options: { force?: boolean }) => {
      await runInit(options);
    });

  for (const [name, description, action] of [
    ["triage", "Analyze an issue and produce a Markdown triage report.", runTriage],
    ["plan", "Generate a Markdown implementation plan for an issue.", runPlan],
  ] as const) {
    program
      .command(name)
      .description(description)
      .option("--text <issue>", "read the issue from command-line text")
      .option("--file <path>", "read the issue from a local Markdown or text file")
      .option("--prompt-only", "generate a prompt for Codex or another AI instead of an answer")
      .action(async (options: { text?: string; file?: string; promptOnly?: boolean }) => {
        await action(options);
      });
  }

  return program;
}
