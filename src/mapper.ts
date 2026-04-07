import type { ParsedCommand } from "./parser.js";

export type MapResult =
  | { type: "pass" }
  | { type: "rewrite"; command: string }
  | { type: "block"; reason: string };

const MANAGERS = ["npm", "yarn", "pnpm", "bun"] as const;

const COMMAND_ALIASES: Record<string, string> = {
  i: "install",
  add: "add",
  install: "install",
  remove: "remove",
  uninstall: "remove",
  run: "run",
  dlx: "dlx",
  x: "dlx",
};

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

  if (sourceManager === "npm") {
    if (sourceCommand === "npx") {
      return { type: "rewrite", command: `${targetManager} dlx ${args.join(" ")}`.trim() };
    }
    if (sourceCommand === "install" && args.length === 0) {
      return { type: "rewrite", command: `${targetManager} install` };
    }
    if (sourceCommand === "install" && args.length > 0) {
      return { type: "rewrite", command: `${targetManager} add ${args.join(" ")}` };
    }
    if (sourceCommand === "add") {
      return { type: "rewrite", command: `${targetManager} add ${args.join(" ")}` };
    }
    if (sourceCommand === "run") {
      return { type: "rewrite", command: `${targetManager} run ${args.join(" ")}` };
    }
  }

  if (sourceManager === "yarn") {
    if (sourceCommand === "dlx") {
      return { type: "rewrite", command: `${targetManager} dlx ${args.join(" ")}` };
    }
    if (sourceCommand === "install" && args.length === 0) {
      return { type: "rewrite", command: `${targetManager} install` };
    }
    if (sourceCommand === "add") {
      return { type: "rewrite", command: `${targetManager} add ${args.join(" ")}` };
    }
    if (sourceCommand === "remove") {
      return { type: "rewrite", command: `${targetManager} remove ${args.join(" ")}` };
    }
    if (sourceCommand === "run") {
      return { type: "rewrite", command: `${targetManager} run ${args.join(" ")}` };
    }
  }

  if (sourceManager === "pnpm") {
    if (sourceCommand === "dlx") {
      return { type: "rewrite", command: `${targetManager} dlx ${args.join(" ")}` };
    }
    if (sourceCommand === "install" && args.length === 0) {
      return { type: "rewrite", command: `${targetManager} install` };
    }
    if (sourceCommand === "add") {
      return { type: "rewrite", command: `${targetManager} add ${args.join(" ")}` };
    }
    if (sourceCommand === "remove") {
      return { type: "rewrite", command: `${targetManager} remove ${args.join(" ")}` };
    }
    if (sourceCommand === "run") {
      return { type: "rewrite", command: `${targetManager} run ${args.join(" ")}` };
    }
  }

  return { type: "block", reason: `Unsupported command: ${parsed.command}` };
}

function normalizeCommand(cmd: string): string {
  return COMMAND_ALIASES[cmd] || cmd;
}
