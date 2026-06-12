import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const cli = path.join(root, "dist", "index.js");

function run(args, options = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: options.cwd ?? root,
    encoding: "utf8",
  });
}

const help = run(["--help"]);
assert.equal(help.status, 0);
assert.match(help.stdout, /Commands:/);

const version = run(["--version"]);
const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
assert.equal(version.stdout.trim(), packageJson.version);

const triage = run(["triage", "--text", "The CLI crashes on startup"]);
assert.equal(triage.status, 0);
assert.match(triage.stdout, /# Triage Result/);
assert.match(triage.stdout, /## Type\nbug/);

const issueDirectory = await mkdtemp(path.join(os.tmpdir(), "maintainerkit-cli-"));
await writeFile(path.join(issueDirectory, "issue.md"), "READMEの説明を更新したい\n");
await mkdir(path.join(issueDirectory, "tests"));
const contextualTriage = run(["triage", "--text", "Increase test coverage"], {
  cwd: issueDirectory,
});
assert.equal(contextualTriage.status, 0);
assert.match(contextualTriage.stdout, /- tests\//);

const plan = run(["plan", "--file", "issue.md"], { cwd: issueDirectory });
assert.equal(plan.status, 0);
assert.match(plan.stdout, /# Implementation Plan/);

const prompt = run(["triage", "--file", "issue.md", "--prompt-only"], {
  cwd: issueDirectory,
});
assert.equal(prompt.status, 0);
assert.match(prompt.stdout, /You are Codex/);

for (const args of [
  ["triage"],
  ["triage", "--text", "x", "--file", "issue.md"],
  ["plan", "--text", "   "],
  ["plan", "--file", "missing.md"],
]) {
  const invalid = run(args, { cwd: issueDirectory });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /maintainerkit:/);
}

const initDirectory = await mkdtemp(path.join(os.tmpdir(), "maintainerkit-init-"));
const firstInit = run(["init"], { cwd: initDirectory });
assert.equal(firstInit.status, 0);
assert.match(firstInit.stdout, /created AGENTS\.md/);
assert.match(firstInit.stdout, /summary: \d+ created, 0 overwritten, 0 skipped/);
assert.equal(firstInit.stderr, "");

await writeFile(path.join(initDirectory, "AGENTS.md"), "custom content\n");
const secondInit = run(["init"], { cwd: initDirectory });
assert.equal(secondInit.status, 0);
assert.match(secondInit.stdout, /skipped AGENTS\.md/);
assert.match(secondInit.stdout, /summary: 0 created, 0 overwritten, \d+ skipped/);
assert.equal(secondInit.stderr, "");
assert.equal(await readFile(path.join(initDirectory, "AGENTS.md"), "utf8"), "custom content\n");

const forcedInit = run(["init", "--force"], { cwd: initDirectory });
assert.equal(forcedInit.status, 0);
assert.match(forcedInit.stdout, /overwritten AGENTS\.md/);
assert.match(forcedInit.stdout, /summary: 0 created, \d+ overwritten, 0 skipped/);
assert.equal(forcedInit.stderr, "");
assert.match(await readFile(path.join(initDirectory, "AGENTS.md"), "utf8"), /# AGENTS\.md/);

const config = JSON.parse(
  await readFile(path.join(initDirectory, ".maintainerkit", "config.json"), "utf8"),
);
assert.equal(config.agent.allowAutoPr, false);
assert.equal(config.agent.requirePlanBeforeChanges, true);

console.log("CLI smoke tests passed.");
