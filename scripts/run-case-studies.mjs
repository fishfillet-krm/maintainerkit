import { execFileSync } from "node:child_process";
import { access, mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { detectProject } from "../dist/core/detectProject.js";
import { generatedFiles } from "../dist/core/templates.js";

const repositories = [
  { name: "commander.js", url: "https://github.com/tj/commander.js.git" },
  { name: "click", url: "https://github.com/pallets/click.git" },
  { name: "fd", url: "https://github.com/sharkdp/fd.git" },
  { name: "cobra", url: "https://github.com/spf13/cobra.git" },
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

const workRoot = await mkdtemp(path.join(os.tmpdir(), "maintainerkit-case-studies-"));
const results = [];

try {
  for (const repository of repositories) {
    const target = path.join(workRoot, repository.name);
    execFileSync("git", ["clone", "--depth", "1", "--filter=blob:none", repository.url, target], {
      stdio: "ignore",
    });

    const sha = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: target,
      encoding: "utf8",
    }).trim();
    const project = await detectProject(target);
    const candidates = Object.keys(generatedFiles(project));
    const collisions = [];
    for (const candidate of candidates) {
      if (await exists(path.join(target, candidate))) collisions.push(candidate);
    }

    results.push({
      name: repository.name,
      repository: repository.url.replace(/\.git$/, ""),
      commit: sha,
      detected: {
        projectName: project.projectName,
        packageManager: project.packageManager,
        languages: project.languages,
        directories: project.directories,
        commands: project.commands,
      },
      generatedFileCandidates: candidates,
      existingFileCollisions: collisions,
      writesPerformed: false,
    });
  }
} finally {
  await rm(workRoot, { recursive: true, force: true });
}

const report = {
  generatedAt: new Date().toISOString(),
  methodology:
    "Read-only shallow clones. MaintainerKit detection and template generation ran in memory; no target repository files were written.",
  results,
};
const output = path.resolve(
  process.cwd(),
  process.argv[2] ?? path.join("docs", "case-studies.json"),
);
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${path.relative(process.cwd(), output)} with ${results.length} case studies.`);
