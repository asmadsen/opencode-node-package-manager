import type { ParsedCommand } from "./parser.js";

export type MapResult =
  | { type: "pass" }
  | { type: "rewrite"; command: string }
  | { type: "block"; reason: string };

const COMMAND_ALIASES: Record<string, string> = {
  i: "install",
  add: "add",
  install: "install",
  remove: "remove",
  uninstall: "remove",
  run: "run",
};

const ADD_COMMANDS: Record<string, string> = {
  npm: "install",
  yarn: "add",
  pnpm: "add",
  bun: "add",
};

const REMOVE_COMMANDS: Record<string, string> = {
  npm: "uninstall",
  yarn: "remove",
  pnpm: "remove",
  bun: "remove",
};

const EXEC_COMMANDS: Record<string, string> = {
  bun: "bunx",
  npm: "npx",
  yarn: "yarn dlx",
  pnpm: "pnpm dlx",
};

function buildCommand(manager: string, command: string, args: string[]): string {
  const parts = command ? [manager, command, ...args] : [manager, ...args];
  return parts.join(" ");
}

export function mapCommand(
  detectedManager: string,
  parsed: ParsedCommand
): MapResult {
  if (parsed.manager === detectedManager) {
    return { type: "pass" };
  }

  const targetManager = detectedManager;
  const sourceCommand = normalizeCommand(parsed.command);
  const args = parsed.args;

  if (isExecCommand(sourceCommand)) {
    const targetExec = EXEC_COMMANDS[targetManager];
    if (!targetExec) {
      return { type: "block", reason: `Unsupported target manager: ${targetManager}` };
    }
    return { type: "rewrite", command: buildCommand(targetExec, "", args) };
  }

  if (sourceCommand === "install" && args.length === 0) {
    return { type: "rewrite", command: `${targetManager} install` };
  }
  if (sourceCommand === "install" && args.length > 0) {
    const addCmd = ADD_COMMANDS[targetManager];
    if (!addCmd) return { type: "block", reason: `Unsupported target manager: ${targetManager}` };
    return { type: "rewrite", command: buildCommand(targetManager, addCmd, args) };
  }
  if (sourceCommand === "add") {
    const addCmd = ADD_COMMANDS[targetManager];
    if (!addCmd) return { type: "block", reason: `Unsupported target manager: ${targetManager}` };
    return { type: "rewrite", command: buildCommand(targetManager, addCmd, args) };
  }
  if (sourceCommand === "remove") {
    const rmCmd = REMOVE_COMMANDS[targetManager];
    if (!rmCmd) return { type: "block", reason: `Unsupported target manager: ${targetManager}` };
    return { type: "rewrite", command: buildCommand(targetManager, rmCmd, args) };
  }
  if (sourceCommand === "run") {
    return { type: "rewrite", command: buildCommand(targetManager, "run", args) };
  }

  return { type: "block", reason: `Unsupported command: ${parsed.command}` };
}

function isExecCommand(command: string): boolean {
  if (command === "npx") return true;
  if (command === "bunx") return true;
  if (command === "pnpx") return true;
  if (command === "yarn dlx") return true;
  return false;
}

function normalizeCommand(cmd: string): string {
  return COMMAND_ALIASES[cmd] || cmd;
}