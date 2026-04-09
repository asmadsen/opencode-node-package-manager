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

  const sourceManager = parsed.manager;
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
    return { type: "rewrite", command: buildCommand(targetManager, "add", args) };
  }
  if (sourceCommand === "add") {
    return { type: "rewrite", command: buildCommand(targetManager, "add", args) };
  }
  if (sourceCommand === "remove") {
    return { type: "rewrite", command: buildCommand(targetManager, "remove", args) };
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