import { chmod } from "node:fs/promises";
import { URL } from "node:url";

if (process.platform !== "win32") {
  await chmod(new URL("../dist/index.js", import.meta.url), 0o755);
}
