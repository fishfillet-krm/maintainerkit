# Impact Report

This report records observable evidence without treating internal validation as independent
third-party adoption.

## Snapshot

Retrieved from the GitHub API on 2026-06-11 at approximately 22:18 JST:

- Stars: 0
- Forks: 0
- Watchers: 0
- 14-day repository views: 0 total, 0 unique
- 14-day repository clones: 0 total, 0 unique
- Open roadmap issues: 6
- Community Profile health: 100%

MaintainerKit is new and is not yet widely used. These values are a baseline, not evidence of
broad impact.

## Operational Evidence

- Four read-only public OSS case studies cover Commander.js, Click, fd, and Cobra.
- Case-study inputs are pinned to commit SHAs and the results are stored as Markdown and JSON.
- MaintainerKit tests its own generated repository guidance to detect producer/consumer drift.
- Coverage thresholds require 85% lines, functions, and statements, plus 75% branches.
- CI verifies Node.js 20, 22, and 24 and package behavior on Linux, macOS, and Windows.

## Adoption Pilot

The owner-operated
[mc-localize pilot PR](https://github.com/fishfillet-krm/mc-localize/pull/15) was merged on
2026-06-11.

- `maintainerkit init` created only previously absent files.
- Running `init` again skipped every generated path.
- Existing source, tests, README, design document, package metadata, and CI were unchanged.
- The generated configuration was reviewed and given the repository-backed Python test command.
- GitHub Actions passed on Python 3.10, 3.11, and 3.12.

This pilot proves a real repository adoption under the same owner. It is not independent external
maintainer adoption.

## Release Evidence

The [`v0.1.0` release](https://github.com/fishfillet-krm/maintainerkit/releases/tag/v0.1.0)
was published on 2026-06-12 at 07:13 JST by the
[release workflow](https://github.com/fishfillet-krm/maintainerkit/actions/runs/27380734928).

- The workflow passed the complete verification suite before packaging.
- `maintainerkit-0.1.0.tgz` contains 64 published files and excludes source, tests, and GitHub
  configuration.
- The downloaded tarball matches the published `SHA256SUMS` entry.
- The SBOM is CycloneDX 1.6 and records 273 components.
- npm publication remains a separate human approval gate and has not occurred.
