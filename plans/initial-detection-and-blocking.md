# Plan: Package Manager Detection and Blocking

> Source PRD: `.prds/001-initial-detection-and-blocking.md`

## Architectural decisions

Durable decisions that apply across all phases:

- **Plugin Hook**: Uses `tool.execute.before` hook to intercept bash tool calls before execution
- **Module Structure**: Four pure modules (detector, parser, validator) plus thin orchestration layer in `src/index.ts`
- **Detection Priority**: (1) `packageManager` field in package.json, (2) `devEngines.packageManager` field, (3) single lockfile detection
- **Supported Lockfiles**: `bun.lock`, `bun.lockb`, `yarn.lock`, `pnpm-lock.yaml`, `package-lock.json`
- **Error Message Format**: "Use {detected_manager} instead of {attempted_manager}"
- **Fallback Behavior**: Allow all commands when no package manager can be detected
- **No Configuration**: Plugin relies entirely on project-level detection, no plugin-specific config files

---

## Phase 1: Core Detection and Blocking (MVP)

**User stories**: 1, 2, 4, 6, 7, 9, 12, 13, 14, 15, 16, 17

### What to build

A complete end-to-end implementation that detects the project's package manager, parses bash commands for package manager invocations, and blocks commands when there's a mismatch. This phase implements detection from the `packageManager` field and single lockfiles, parsing for basic package manager commands (npm, yarn, pnpm, bun), and blocking with simple error messages. When no package manager can be detected, all commands are allowed.

### Acceptance criteria

- [ ] Plugin registers `tool.execute.before` hook that filters to bash tool only
- [ ] Detector module successfully reads `packageManager` field from package.json
- [ ] Detector module successfully detects package manager from single lockfile presence
- [ ] Detector module returns correct manager and source information
- [ ] Parser module identifies npm, yarn, pnpm, bun commands from bash command strings
- [ ] Parser module extracts package manager name and command arguments
- [ ] Parser module returns null for non-package-manager commands
- [ ] Validator module returns valid for matching manager and command
- [ ] Validator module returns invalid with message for mismatched manager and command
- [ ] Orchestration layer correctly sequences detector → parser → validator
- [ ] When no package manager detected, all commands pass validation
- [ ] Unit tests pass for all three pure modules (detector, parser, validator)
- [ ] Plugin blocks `npm install` in bun project with message "Use bun instead of npm"
- [ ] Plugin blocks `yarn add` in pnpm project with message "Use pnpm instead of yarn"

---

## Phase 2: devEngines Support

**User stories**: 3

### What to build

Extends detection to check `devEngines.packageManager` field as a fallback when top-level `packageManager` field is not present. This supports modern package.json configurations that use the devEngines specification.

### Acceptance criteria

- [ ] Detector module checks `devEngines.packageManager` field after top-level `packageManager`
- [ ] Detection priority correctly follows: top-level packageManager → devEngines.packageManager → lockfiles
- [ ] Plugin successfully detects package manager from `devEngines.packageManager` field
- [ ] Unit tests verify devEngines detection priority

---

## Phase 3: Multiple Lockfile Handling

**User stories**: 5

### What to build

Detects when multiple lockfiles are present in the project root. Instead of arbitrarily choosing one, returns an error instructing the user to explicitly set the `packageManager` field in package.json. This prevents ambiguous detection scenarios.

### Acceptance criteria

- [ ] Detector module identifies presence of multiple lockfiles
- [ ] Detector module returns error with instruction when multiple lockfiles found
- [ ] Error message informs user to set `packageManager` field explicitly
- [ ] Plugin allows all commands when detection returns error
- [ ] Unit tests cover multiple lockfile scenarios

---

## Phase 4: Monorepo Tool Exemption

**User stories**: 8

### What to build

Allows monorepo tool commands (nx, turbo, lerna) to execute regardless of detected package manager. These tools operate above the package manager level and should not be blocked.

### Acceptance criteria

- [ ] Parser module identifies nx, turbo, lerna commands
- [ ] Validator module always returns valid for monorepo tool commands
- [ ] Monorepo tools pass validation even when package manager mismatch exists
- [ ] Unit tests verify monorepo tool exemption logic

---

## Phase 5: Package Execution and Run Commands

**User stories**: 10, 11

### What to build

Extends command parsing to handle package execution commands (npx, bunx, yarn dlx, pnpx) and run commands (npm run, yarn run, pnpm run, bun run). These are common package manager operations that should also be validated.

### Acceptance criteria

- [ ] Parser module identifies npx, bunx, yarn dlx, pnpx commands
- [ ] Parser module identifies npm run, yarn run, pnpm run, bun run commands
- [ ] Validator module correctly validates package execution commands
- [ ] Validator module correctly validates run commands
- [ ] Plugin blocks `npx create-react-app` in bun project with appropriate message
- [ ] Plugin blocks `npm run build` in yarn project with appropriate message
- [ ] Unit tests cover all package execution and run command variations

---

## Complete: Move PRD to completed

Move the source PRD file from `.prds/001-initial-detection-and-blocking.md` to `.prds/completed/001-initial-detection-and-blocking.md`.

Create `.prds/completed/` directory if it doesn't exist.