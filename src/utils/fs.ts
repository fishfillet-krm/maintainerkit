import { readFile } from "node:fs/promises";
import path from "node:path";

export async function readIssueInput(options: {
  text?: string;
  file?: string;
  cwd?: string;
}): Promise<string> {
  const textProvided = options.text !== undefined;
  const fileProvided = options.file !== undefined;

  if (textProvided === fileProvided) {
    throw new Error("Provide exactly one of --text or --file.");
  }

  let content: string;
  if (textProvided) {
    content = options.text ?? "";
  } else {
    const filePath = path.resolve(options.cwd ?? process.cwd(), options.file ?? "");
    try {
      content = await readFile(filePath, "utf8");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not read issue file: ${message}`);
    }
  }

  if (content.trim().length === 0) {
    throw new Error("Issue input must not be empty.");
  }

  return content.trim();
}
