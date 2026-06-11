export function createTriagePrompt(issue: string): string {
  return `You are Codex acting as the primary developer of an open-source repository.
Analyze the issue below for safe implementation readiness.

Return Markdown with these sections:
# Triage Result
## Summary
## Type
## Suggested Labels
## Priority
## Difficulty
## Affected Area
## Missing Information
## Suggested Next Action
## Codex Readiness

Use exactly one readiness value: ready, needs-human-clarification, or blocked.
Treat authentication, authorization, security, billing, deployment, and release changes as requiring explicit human approval.

Issue:
${issue}`;
}

export function createPlanPrompt(issue: string): string {
  return `You are Codex acting as the primary developer of an open-source repository.
Produce a small, reviewable implementation plan for the issue below before making changes.

Return Markdown with these sections:
# Implementation Plan
## Goal
## Current Understanding
## Files Likely to Change
## Proposed Steps
## Tests to Add or Update
## Risks
## Human Approval Required?
## Pre-PR Checklist

Do not assume unknown repository details. Always include risks and require explicit human approval for authentication, authorization, security, billing, deployment, release, or public API changes.

Issue:
${issue}`;
}
