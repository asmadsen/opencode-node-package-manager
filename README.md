# @asmadsen/opencode-node-package-manager

An [opencode](https://opencode.ai) plugin that intercepts package manager commands and validates they match the project's configured package manager.

## What it does

When opencode (or an AI agent using opencode) attempts to run a package manager command (npm, yarn, pnpm, bun), this plugin:

1. **Detects** the project's package manager from:
   - `packageManager` field in `package.json`
   - `devEngines.packageManager` field in `package.json`
   - Lockfile presence (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock`, `bun.lockb`)

2. **Validates** that commands use the correct package manager

3. **Blocks** commands that use a different package manager with a helpful error message

## Installation

### From npm

Add to your `opencode.json`:

```json
{
  "plugin": ["@asmadsen/opencode-node-package-manager"]
}
```

### Local development

Place the compiled file in `.opencode/plugins/` directory or reference a local path.

## Detection Priority

The plugin detects the package manager in this order:

1. `packageManager` field in `package.json` (e.g., `"bun@1.2.18"`)
2. `devEngines.packageManager` field in `package.json`
3. Lockfile detection:
   - `bun.lock` or `bun.lockb` → bun
   - `yarn.lock` → yarn
   - `pnpm-lock.yaml` → pnpm
   - `package-lock.json` →npm

## Supported Commands

- `npm`, `yarn`, `pnpm`, `bun` with any subcommand
- `npx`, `bunx`, `pnpx`, `yarn dlx`

## Example

If your project uses bun (detected via `packageManager: "bun@1.2.18"`), and opencode attempts:

```bash
npm install lodash
```

The plugin will block it with:

```
Use bun instead of npm
```

## WIP /TODO

- [ ] Auto-rewrite commands to use correct package manager instead of just blocking
- [ ] Handle command translation (e.g., `npm install` → `bun add`)
- [ ] Add configuration for allowed package managers
- [ ] Handle monorepo scenarios with multiple package managers

## Development

```bash
bun install
bun test
bun run build
```