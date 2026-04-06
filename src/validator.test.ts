import { describe, it, expect } from "vitest";
import { validateCommand } from "./validator.js";

describe("validateCommand", () => {
  it("returns valid when manager matches", () => {
    const result = validateCommand("npm", { manager: "npm", command: "install", args: [] });
    expect(result).toEqual({ valid: true });
  });

  it("returns invalid with message when manager does not match", () => {
    const result = validateCommand("bun", { manager: "npm", command: "install", args: [] });
    expect(result).toEqual({ valid: false, message: "Use bun instead of npm" });
  });

  it("blocks yarn in pnpm project", () => {
    const result = validateCommand("pnpm", { manager: "yarn", command: "add", args: [] });
    expect(result).toEqual({ valid: false, message: "Use pnpm instead of yarn" });
  });

  it("blocks npm in yarn project", () => {
    const result = validateCommand("yarn", { manager: "npm", command: "install", args: [] });
    expect(result).toEqual({ valid: false, message: "Use yarn instead of npm" });
  });

  it("blocks npx in bun project", () => {
    const result = validateCommand("bun", { manager: "npm", command: "npx", args: ["something"] });
    expect(result).toEqual({ valid: false, message: "Use bun instead of npm" });
  });

  it("blocks bunx in npm project", () => {
    const result = validateCommand("npm", { manager: "bun", command: "bunx", args: ["something"] });
    expect(result).toEqual({ valid: false, message: "Use npm instead of bun" });
  });

  it("blocks yarn dlx in pnpm project", () => {
    const result = validateCommand("pnpm", { manager: "yarn", command: "yarn dlx", args: ["something"] });
    expect(result).toEqual({ valid: false, message: "Use pnpm instead of yarn" });
  });

  it("blocks npm run in yarn project", () => {
    const result = validateCommand("yarn", { manager: "npm", command: "run", args: ["build"] });
    expect(result).toEqual({ valid: false, message: "Use yarn instead of npm" });
  });

  it("blocks yarn run in pnpm project", () => {
    const result = validateCommand("pnpm", { manager: "yarn", command: "run", args: ["build"] });
    expect(result).toEqual({ valid: false, message: "Use pnpm instead of yarn" });
  });

  it("blocks pnpm run in bun project", () => {
    const result = validateCommand("bun", { manager: "pnpm", command: "run", args: ["build"] });
    expect(result).toEqual({ valid: false, message: "Use bun instead of pnpm" });
  });
});