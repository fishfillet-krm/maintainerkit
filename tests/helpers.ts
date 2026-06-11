import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const tempDirs: string[] = [];

export async function makeTempDir(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "maintainerkit-"));
  tempDirs.push(directory);
  return directory;
}

export async function removeTempDirs(): Promise<void> {
  await Promise.all(tempDirs.splice(0).map((directory) => rm(directory, { recursive: true })));
}
