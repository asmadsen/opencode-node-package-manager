# Plan: Beachball Release Handling Setup

> Source PRD: GitHub Issue #12

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: Not applicable (CLI tool, no HTTP routes)
- **Schema**: Single-package repo, no monorepo support initially
- **Key models**: Beachball change file format (JSON with type, comment, packageName)
- **Package manager**: Bun (project standard via `packageManager` field)
- **Change file location**: `change/` directory at repo root (beachball default)
- **CI**: GitHub Actions only
- **Release trigger**: Push to main branch (automated) + workflow_dispatch (manual)

---

## Phase 1: Beachball Installation & Configuration

**User stories**: 1, 2, 8, 9, 13, 15

### What to build

Install beachball as a devDependency and configure it in package.json. Add an interactive `change` script that developers run to create properly formatted change files. Configure ignore patterns so README-only changes don't require change files.

### Acceptance criteria

- [ ] beachball installed as devDependency
- [ ] beachball configuration present in package.json (branch: "origin/main", access: "public")
- [ ] `bun run change` script triggers interactive change file creation
- [ ] `ignorePatterns` configured to skip README, test files, and similar
- [ ] Documentation added to README on how to create change files

---

## Phase 2: PR Change File Validation

**User stories**: 3, 4, 10

### What to build

Add a CI job that runs on every pull request to validate that all PRs include change files. The job should run `beachball check` and fail with a clear error message if changes lack documentation.

### Acceptance criteria

- [ ] New CI workflow (or job in existing workflow) runs `beachball check` on PRs
- [ ] CI fails when change files are missing
- [ ] Error message clearly indicates which package needs a change file
- [ ] CI passes when valid change files are present

---

## Phase 3: Automated Publishing

**User stories**: 5, 6, 7, 11, 12, 14

### What to build

Replace the current publish workflow with a beachball-driven release process. On push to main or manual dispatch, beachball will: calculate version bump from accumulated change files, update CHANGELOG.md, create git commit/tag, and publish to npm. Configure GitHub `release` environment with required secrets (NPM_TOKEN, REPO_PAT).

### Acceptance criteria

- [ ] Publish workflow updated to use `beachball publish`
- [ ] `release` GitHub environment configured with secrets
- [ ] Version bumping works correctly based on change file types
- [ ] CHANGELOG.md generated from change file descriptions
- [ ] Git commit/tag created with version bump
- [ ] npm publish succeeds with provenance
- [ ] workflow_dispatch allows manual trigger
- [ ] Dry-run tested successfully before first production release

---

## Complete: Move PRD to completed

Move the source PRD from GitHub Issue #12 to `.prds/completed/`.

Create `.prds/completed/` directory if it doesn't exist.
