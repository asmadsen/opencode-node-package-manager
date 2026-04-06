import { describe, it, expect } from "vitest";
import { parseCommand } from "./parser.js";

describe("parseCommand", () => {
  it("parses npm install", () => {
    const result = parseCommand("npm install");
    expect(result).toEqual({ manager: "npm", command: "install", args: [] });
  });

  it("parses npm i", () => {
    const result = parseCommand("npm i");
    expect(result).toEqual({ manager: "npm", command: "i", args: [] });
  });

  it("parses npm add", () => {
    const result = parseCommand("npm add");
    expect(result).toEqual({ manager: "npm", command: "add", args: [] });
  });

  it("parses yarn add", () => {
    const result = parseCommand("yarn add");
    expect(result).toEqual({ manager: "yarn", command: "add", args: [] });
  });

  it("parses yarn install", () => {
    const result = parseCommand("yarn install");
    expect(result).toEqual({ manager: "yarn", command: "install", args: [] });
  });

  it("parses pnpm install", () => {
    const result = parseCommand("pnpm install");
    expect(result).toEqual({ manager: "pnpm", command: "install", args: [] });
  });

  it("parses pnpm i", () => {
    const result = parseCommand("pnpm i");
    expect(result).toEqual({ manager: "pnpm", command: "i", args: [] });
  });

  it("parses bun install", () => {
    const result = parseCommand("bun install");
    expect(result).toEqual({ manager: "bun", command: "install", args: [] });
  });

  it("parses npx", () => {
    const result = parseCommand("npx create-react-app");
    expect(result).toEqual({ manager: "npm", command: "npx", args: ["create-react-app"] });
  });

  it("parses bunx", () => {
    const result = parseCommand("bunx something");
    expect(result).toEqual({ manager: "bun", command: "bunx", args: ["something"] });
  });

  it("parses yarn dlx", () => {
    const result = parseCommand("yarn dlx something");
    expect(result).toEqual({ manager: "yarn", command: "yarn dlx", args: ["something"] });
  });

  it("parses pnpx", () => {
    const result = parseCommand("pnpx something");
    expect(result).toEqual({ manager: "pnpm", command: "pnpx", args: ["something"] });
  });

  it("parses npm run", () => {
    const result = parseCommand("npm run build");
    expect(result).toEqual({ manager: "npm", command: "run", args: ["build"] });
  });

  it("parses yarn run", () => {
    const result = parseCommand("yarn run build");
    expect(result).toEqual({ manager: "yarn", command: "run", args: ["build"] });
  });

  it("parses pnpm run", () => {
    const result = parseCommand("pnpm run build");
    expect(result).toEqual({ manager: "pnpm", command: "run", args: ["build"] });
  });

  it("parses bun run", () => {
    const result = parseCommand("bun run build");
    expect(result).toEqual({ manager: "bun", command: "run", args: ["build"] });
  });

  it("returns null for monorepo tools (nx, turbo, lerna)", () => {
    expect(parseCommand("nx build")).toBeNull();
    expect(parseCommand("turbo build")).toBeNull();
    expect(parseCommand("lerna build")).toBeNull();
  });

  it("returns null for non-package-manager commands", () => {
    expect(parseCommand("ls")).toBeNull();
    expect(parseCommand("git status")).toBeNull();
    expect(parseCommand("echo hello")).toBeNull();
  });

  it("handles quoted arguments", () => {
    const result = parseCommand('npm install "my package"');
    expect(result).toEqual({ manager: "npm", command: "install", args: ["my package"] });
  });

  it("handles arguments with equals", () => {
    const result = parseCommand("npm install --save-dev typescript");
    expect(result).toEqual({ manager: "npm", command: "install", args: ["--save-dev", "typescript"] });
  });

  it("handles empty string", () => {
    expect(parseCommand("")).toBeNull();
  });

  it("handles whitespace only", () => {
    expect(parseCommand("   ")).toBeNull();
  });
});