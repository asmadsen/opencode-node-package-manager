# 002-command-mapping

**Status: In Progress**

## Problem Statement

Currently the plugin only **blocks** incorrect package manager commands with an error message. This forces AI models to re-attempt commands with the correct package manager, which wastes time and tokens. For simple, well-defined commands that have clear equivalents across package managers, the plugin could automatically **rewrite** commands instead of blocking them.

## Solution

Extend the plugin to map simple package manager commands to their equivalents. Commands like `npm install`, `npm add lodash`, `npm run build` will be rewritten to the detected package manager's equivalent (e.g., `bun install`, `bun add lodash`, `bun run build`). Commands without clear equivalents or with unsupported flags will still be blocked with an informative error.

## User Stories

1. As an opencode user, I want `npm install` to automatically become `bun install` in a bun project, so the AI can proceed without re-attempting.

2. As an opencode user, I want `npm install lodash` to become `bun add lodash`, so packages are added correctly.

3. As an opencode user, I want `npm install --save-dev lodash` to become `bun add --dev lodash`, so dev dependencies work correctly.

4. As an opencode user, I want `npm uninstall lodash` to become `bun remove lodash`, so removal commands work correctly.

5. As an opencode user, I want `npm run build` to become `bun run build`, so scripts run with the correct package manager.

6. As an opencode user, I want `npx create-react-app` to become `bunx create-react-app`, so package execution commands are mapped.

7. As an opencode user, I want shorthand commands like `npm i` expanded to `bun install` for clarity.

8. As an opencode user, I want `npm publish` blocked (not rewritten), so publish commands require explicit correct usage.

9. As an opencode user, I want global commands like `npm install -g typescript` blocked, so global installs require explicit correct usage.

10. As an opencode user, I want `npm ci` mapped to equivalents when available (e.g., `pnpm install --frozen-lockfile`), or blocked when no equivalent exists (e.g., bun), so lockfile-only commands require explicit correct usage.

11. As an opencode user, I want commands with unknown/unsupported flags blocked to require explicit correct usage, so I'm forced to use the correct package manager with correct flags.

12. As an opencode user, I want version specifiers preserved, so `npm install lodash@4.17.0` becomes `bun add lodash@4.17.0`.

13. As an opencode user, I want multiple packages in one command mapped, so `npm install lodash react` becomes `bun add lodash react`.

14. As an opencode user, I want optional dependency flags mapped when equivalents exist (`--save-optional` / `-O`), or blocked if no equivalent exists in target manager.

15. As an opencode user, I want peer dependency flags mapped when equivalents exist, or blocked when no equivalent exists (`--peer` in bun).

16. As an opencode user, I want implicit script execution (e.g., `pnpm dev` which is shorthand for `pnpm run dev`) mapped to explicit form (`bun run dev`), so commands are clear and explicit.

17. As a plugin developer, I want the mapping logic in a pure function module, so it's easy to test in isolation.

18. As a plugin developer, I want all modules tested thoroughly with unit tests.

## Implementation Decisions

- Replace `validator.ts` with `mapper.ts` that returns one of three results: `pass`, `rewrite`, or `block`
- The mapper will handle all command classification and rewriting logic

**Command Mapping Rules:**

| Source Command | Target (bun example) |
|----------------|---------------------|
| `npm install` (no args) | `bun install` |
| `npm install <pkg>` | `bun add <pkg>` |
| `npm i` | `bun install` |
| `npm i <pkg>` | `bun add <pkg>` |
| `npm add <pkg>` | `bun add <pkg>` |
| `npm uninstall <pkg>` | `bun remove <pkg>` |
| `npm remove <pkg>` | `bun remove <pkg>` |
| `npm run <script>` | `bun run <script>` |
| `npm <script>` (implicit run) | `bun run <script>` |
| `npx <pkg>` | `bunx <pkg>` |
| `yarn install` | `bun install` |
| `yarn add <pkg>` | `bun add <pkg>` |
| `yarn remove <pkg>` | `bun remove <pkg>` |
| `yarn run <script>` | `bun run <script>` |
| `yarn <script>` (implicit run) | `bun run <script>` |
| `yarn dlx <pkg>` | `bunx <pkg>` |
| `pnpm install` | `bun install` |
| `pnpm add <pkg>` | `bun add <pkg>` |
| `pnpm remove <pkg>` | `bun remove <pkg>` |
| `pnpm run <script>` | `bun run <script>` |
| `pnpm <script>` (implicit run) | `bun run <script>` |
| `pnpx <pkg>` | `bunx <pkg>` |

**Flag Mapping:**

| Flag | npm | yarn | pnpm | bun |
|------|-----|------|------|-----|
| Dev | `--save-dev` / `-D` | `--dev` / `-D` | `--save-dev` / `-D` | `--dev` / `-d` / `-D` |
| Optional | `--save-optional` / `-O` | `--optional` / `-O` | `--save-optional` / `-O` | block (no equivalent) |
| Peer | `--peer` (npm 8+) | block | `--peer` | block |

**Blocked Commands:**
- `publish` and equivalents
- Global install flags (`-g`, `--global`)
- `npm ci` when target manager has no equivalent (blocked for bun, mapped for pnpm/yarn)
- Commands with unknown flags
- Commands with flags that have no equivalent in target manager

**Module Structure:**

- `src/mapper.ts` - Pure function that maps commands between package managers
  - Input: detectedManager, ParsedCommand
  - Output: `{ type: 'pass' }` | `{ type: 'rewrite'; command: string }` | `{ type: 'block'; reason: string }`
  - Contains all mapping rules and flag translations
  - Handles shorthand expansion

- `src/parser.ts` - Unchanged (already handles command parsing)

- `src/detector.ts` - Unchanged (already handles detection)

- `src/index.ts` - Modified to use mapper instead of validator
  - If mapper returns `rewrite`, modify the bash command before execution
  - If mapper returns `block`, throw error
  - If mapper returns `pass`, allow execution unchanged

## Testing Decisions

- All tests focus on external behavior, not implementation details
- Pure modules tested with unit tests
- Test file for each module

**Test priority:**

1. `mapper.test.ts` - Test all mapping scenarios:
   - Rewritable commands map correctly
   - Blocked commands return block result with reason
   - Flags map correctly across package managers
   - Shorthands expand correctly
   - Edge cases (empty args, multiple packages, version specifiers)

2. `detector.test.ts` - Unchanged, existing tests sufficient

3. `parser.test.ts` - Unchanged, existing tests sufficient

4. `index.ts` integration tested by verifying rewritten commands execute correctly

## Out of Scope

- Plugin-specific configuration for enabling/disabling rewriting
- Complex command scenarios (workspaces, monorepos)
- Custom registry configurations
- Post-execution hooks or logging
- Statistics about rewritten vs blocked commands

## Further Notes

This is a breaking change from the previous PRD's "block only" behavior. The plugin will now be more helpful by rewriting simple commands instead of forcing re-attempts.