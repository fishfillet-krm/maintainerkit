import { describe, expect, it } from "vitest";
import { createPlanPrompt, createTriagePrompt } from "../src/core/prompts.js";

describe("prompt generation", () => {
  it("includes the issue and required output instructions", () => {
    expect(createTriagePrompt("A crash")).toContain("# Triage Result");
    expect(createTriagePrompt("A crash")).toContain("A crash");
    expect(createPlanPrompt("Add export")).toContain("# Implementation Plan");
    expect(createPlanPrompt("Add export")).toContain("## Risks");
  });
});
