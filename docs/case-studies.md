# Read-only Case Studies

MaintainerKit is evaluated against public OSS repositories without writing to them. These are
compatibility studies, not claims that the upstream maintainers use or endorse MaintainerKit.

## Method

1. Clone a single public commit with `--depth 1 --filter=blob:none`.
2. Run repository detection.
3. Build the generated-file map in memory.
4. Record existing path collisions.
5. Delete the temporary clone.

No issue, branch, commit, pull request, label, comment, or target repository file is created.

Run the study again with:

```bash
pnpm case-studies
```

## Projects

Results are recorded in [case-studies.json](case-studies.json) with exact commit SHAs.

- `tj/commander.js`: JavaScript/TypeScript CLI ecosystem
- `pallets/click`: Python CLI ecosystem
- `sharkdp/fd`: Rust CLI ecosystem
- `spf13/cobra`: Go CLI ecosystem

## Interpretation

Detection success means MaintainerKit recognized repository signals available to its current
heuristics. Empty commands and missed languages or directories are evidence of current limitations,
not silently corrected results.
