## Problem Statement

AI models using opencode may execute bash commands with the wrong Node package manager for a project. For example, running `npm install` in a project that uses `bun`, or `yarn add` in a project that uses `pnpm`. This causes errors, conflicts with existing lockfiles, and creates confusion about which package manager the project actually uses.

## Solution

An opencode plugin that intercepts `bash` tool executions before they run. The plugin detects the project's package manager from `package.json` or lockfiles, parses the bash command to identify package manager invocations, and blocks execution if a mismatch is detected. The error message informs the model which package manager to use, allowing it to correct the command.

## User Stories

1. As an opencode user, I want my AI assistant to automatically detect which package manager my project uses, so that it doesn't accidentally use the wrong one.

2. As an opencode user, I want the plugin to detect my package manager from the `packageManager` field in `package.json`, so that it respects my explicit configuration.

3. As an opencode user, I want the plugin to check `devEngines.packageManager` as a fallback, so that it supports modern package.json configurations.

4. As an opencode user, I want the plugin to detect package manager from lockfiles (bun.lock/bun.lockb, yarn.lock, pnpm-lock.yaml, package-lock.json), so that it works even without explicit configuration.

5. As an opencode user, I want the plugin to error when multiple lockfiles are present, so that I'm prompted to set the `packageManager` field explicitly.

6. As an opencode user, I want simple error messages like "Use bun instead of npm", so that the AI model can understand and correct its behavior.

7. As an opencode user, I want the plugin to block commands with informative errors rather than auto-translating them, so that the AI model learns which package manager to use.

8. As an opencode user, I want monorepo tool commands (nx, turbo, lerna) to always be allowed, so that my monorepo workflow isn't disrupted.

9. As an opencode user, I want the plugin to intercept direct package manager commands (npm, yarn, pnpm, bun), so that core operations are protected.

10. As an opencode user, I want the plugin to intercept `npx` and `bunx` commands, so that package execution tools are also checked.

11. As an opencode user, I want the plugin to intercept run commands (npm run, yarn run, pnpm run), so that script execution uses the right package manager.

12. As an opencode user, I want the plugin to allow all commands when no package manager is detected, so that projects without lockfiles or configuration aren't blocked.

13. As an opencode user, I want the plugin to intercept bash tool calls specifically, so that other tools aren't affected.

14. As a plugin developer, I want the detection logic in a pure function module, so that it's easy to test in isolation.

15. As a plugin developer, I want the command parsing logic in a pure function module, so that it's easy to test various command formats.

16. As a plugin developer, I want the validation logic in a pure function module, so that I can test matching rules without side effects.

17. As a plugin developer, I want the main plugin code to be a thin orchestration layer, so that the complex logic is in testable pure modules.

## Implementation Decisions

- The plugin will use the `tool.execute.before` hook to intercept tool calls before execution
- The hook will filter to only intercept calls where `tool === "bash"`
- Detection priority order: (1) top-level `packageManager` field in package.json, (2) `devEngines.packageManager` field, (3) single lockfile detection
- Supported lockfiles: `bun.lock`, `bun.lockb`, `yarn.lock`, `pnpm-lock.yaml`, `package-lock.json`
- Multiple lockfiles will result in an error message instructing the user to set `packageManager` field
- Command parsing will handle: `npm`, `yarn`, `pnpm`, `bun`, `npx`, `bunx`, `yarn dlx`, `pnpx`, and run-style commands
- Monorepo tools (nx, turbo, lerna) will be allowed regardless of detected package manager
- Error message format: "Use {detected_manager} instead of {attempted_manager}"
- If no package manager can be detected, all commands will be allowed
- No plugin-specific configuration will be supported (relies entirely on project-level detection)

**Module Structure:**

- `src/detector.ts` - Pure function that detects package manager from project files
  - Input: project directory path, BunShell instance
  - Output: `{ manager: 'npm'|'yarn'|'pnpm'|'bun', source: string }` or `null`
  - Priority: package.json fields → lockfiles
  - Errors on multiple lockfiles with instruction to set packageManager

- `src/parser.ts` - Pure function that parses bash commands
  - Input: bash command string
  - Output: `{ manager: string, command: string, args: string[] }` or `null`
  - Handles package manager commands, npx/bunx, run commands
  - Returns null for non-package-manager commands

- `src/validator.ts` - Pure function that validates commands
  - Input: detected manager string, parsed command info
  - Output: `{ valid: boolean, message?: string }`
  - Always validates monorepo tools as true
  - Returns message for invalid commands

- `src/index.ts` - Thin orchestration layer
  - Implements `tool.execute.before` hook
  - Filters to bash tool only
  - Calls detector → parser → validator in sequence
  - Sets error in output if validation fails

## Testing Decisions

- All tests will focus on external behavior, not implementation details
- Pure modules (detector, parser, validator) will have comprehensive unit tests
- No integration tests initially - focus on testing the pure modules thoroughly

**Test priority:**

1. `detector.test.ts` - Test all detection scenarios:
   - packageManager field in package.json
   - devEngines.packageManager field
   - Lockfile detection (each type)
   - Multiple lockfiles error case
   - No detection case

2. `parser.test.ts` - Test all command patterns:
   - Direct commands: npm install, yarn add, pnpm install, bun install
   - Shorthand commands: npm i, yarn add, pnpm i
   - Exec commands: npx, bunx, yarn dlx, pnpx
   - Run commands: npm run, yarn run, pnpm run
   - Non-PM commands should return null
   - Monorepo tool commands

3. `validator.test.ts` - Test validation logic:
   - Matching manager + command = valid
   - Mismatched manager + command = invalid with message
   - Monorepo tools always valid
   - Message format correctness

## Out of Scope

- Auto-translation of commands from one package manager to another
- Plugin-specific configuration files or options
- Override mechanisms for allowing specific commands
- Detection from parent directories or workspaces
- Handling edge cases like custom npm registries or scoped packages
- Post-execution hooks or logging
- Statistics or analytics about blocked commands
- Support for non-Node package managers (pip, cargo, etc.)

## Further Notes

The plugin is intentionally simple and opinionated:
- No configuration to minimize user friction
- Block-only behavior to help models learn correct usage
- Monorepo tools are exempt because they operate above the package manager level
- Detection is project-scoped (current directory only) to keep scope manageable

Future enhancements could include:
- Command translation option (npm install → bun install)
- Configuration file for custom rules
- Support for monorepo detection and workspace-aware validation
- Telemetry about detected managers and blocked commands