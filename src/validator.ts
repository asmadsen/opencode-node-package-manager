import type { ParsedCommand } from "./parser.js";

export type ValidationResult = {
  valid: boolean;
  message?: string;
};

export function validateCommand(
  detectedManager: string,
  parsed: ParsedCommand
): ValidationResult {
  if (parsed.manager === detectedManager) {
    return { valid: true };
  }

  return {
    valid: false,
    message: `Use ${detectedManager} instead of ${parsed.manager}`,
  };
}