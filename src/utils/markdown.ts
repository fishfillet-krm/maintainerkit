export function heading(title: string, level = 2): string {
  return `${"#".repeat(level)} ${title}`;
}

export function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

export function numberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}
