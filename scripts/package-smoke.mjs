import assert from "node:assert/strict";
import { access, mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "maintainerkit-pack-"));
const installDirectory = await mkdtemp(path.join(os.tmpdir(), "maintainerkit-install-"));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmCache = path.join(installDirectory, ".npm-cache");

const packed = spawnSync(
  npmCommand,
  ["pack", "--ignore-scripts", "--pack-destination", outputDirectory],
  {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache: npmCache,
    },
  },
);
assert.equal(packed.status, 0, packed.stderr);

const tarballName = packed.stdout
  .trim()
  .split(/\r?\n/)
  .findLast((line) => line.endsWith(".tgz"));
assert.ok(tarballName, "npm pack did not report a tarball.");
const tarball = path.isAbsolute(tarballName)
  ? tarballName
  : path.join(outputDirectory, path.basename(tarballName));

const installed = spawnSync(
  npmCommand,
  ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball],
  {
    cwd: installDirectory,
    encoding: "utf8",
    env: {
      ...process.env,
      npm_config_cache: npmCache,
    },
  },
);
assert.equal(installed.status, 0, installed.stderr);

const packageDirectory = path.join(installDirectory, "node_modules", "maintainerkit");
for (const relativePath of ["dist/index.js", "dist/index.d.ts", "README.md", "LICENSE"]) {
  await readFile(path.join(packageDirectory, relativePath));
}

for (const excludedPath of ["tests", "src", ".github"]) {
  await assert.rejects(
    access(path.join(packageDirectory, excludedPath)),
    `${excludedPath} should not be included in the package.`,
  );
}

const bin =
  process.platform === "win32"
    ? path.join(installDirectory, "node_modules", ".bin", "maintainerkit.cmd")
    : path.join(installDirectory, "node_modules", ".bin", "maintainerkit");
const help = spawnSync(bin, ["--help"], { cwd: installDirectory, encoding: "utf8" });
assert.equal(help.status, 0, help.stderr);
assert.match(help.stdout, /Prepare repositories for safe AI-assisted maintenance/);

console.log("Package smoke test passed.");
