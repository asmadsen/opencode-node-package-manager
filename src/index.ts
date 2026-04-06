import type { Plugin } from "@opencode-ai/plugin";
import { detectPackageManager } from "./detector.js";
import { parseCommand } from "./parser.js";
import { validateCommand } from "./validator.js";

export const NodePackageManager: Plugin = async (input) => {
  return {
    "tool.execute.before": async (toolInput, output) => {
      if (toolInput.tool !== "bash") {
        return;
      }

      const args = output.args as { command?: string };
      const command = args.command;

      if (!command || typeof command !== "string") {
        return;
      }

      const parsed = parseCommand(command);
      if (!parsed) {
        return;
      }

      const detection = await detectPackageManager(input.directory, input.$);
      if (!detection) {
        return;
      }

      if ("error" in detection && detection.error) {
        throw new Error(detection.message);
      }

      if (!("manager" in detection)) {
        return;
      }

      const validation = validateCommand(detection.manager, parsed);
      if (!validation.valid && validation.message) {
        throw new Error(validation.message);
      }
    },
  };
};