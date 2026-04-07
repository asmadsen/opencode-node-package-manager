import { describe, it, expect } from "vitest";
import { mapCommand } from "./mapper.js";

describe("mapCommand", () => {
  describe("pass when manager matches", () => {
    it("passes npm install in npm project", () => {
      const result = mapCommand("npm", { manager: "npm", command: "install", args: [] });
      expect(result).toEqual({ type: "pass" });
    });

    it("passes bun install in bun project", () => {
      const result = mapCommand("bun", { manager: "bun", command: "install", args: [] });
      expect(result).toEqual({ type: "pass" });
    });

    it("passes yarn add in yarn project", () => {
      const result = mapCommand("yarn", { manager: "yarn", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "pass" });
    });

    it("passes pnpm run in pnpm project", () => {
      const result = mapCommand("pnpm", { manager: "pnpm", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "pass" });
    });
  });

  describe("npm to bun", () => {
    it("rewrites npm install to bun install", () => {
      const result = mapCommand("bun", { manager: "npm", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "bun install" });
    });

    it("rewrites npm install <pkg> to bun add <pkg>", () => {
      const result = mapCommand("bun", { manager: "npm", command: "install", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "bun add lodash" });
    });

    it("rewrites npm add <pkg> to bun add <pkg>", () => {
      const result = mapCommand("bun", { manager: "npm", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "bun add lodash" });
    });

    it("rewrites npm run <script> to bun run <script>", () => {
      const result = mapCommand("bun", { manager: "npm", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "bun run build" });
    });

    it("rewrites npm i to bun install", () => {
      const result = mapCommand("bun", { manager: "npm", command: "i", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "bun install" });
    });

    it("rewrites npm i <pkg> to bun add <pkg>", () => {
      const result = mapCommand("bun", { manager: "npm", command: "i", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "bun add lodash" });
    });

    it("rewrites npx <pkg> to bunx <pkg>", () => {
      const result = mapCommand("bun", { manager: "npm", command: "npx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "bunx create-react-app" });
    });
  });

  describe("npm to yarn", () => {
    it("rewrites npm install to yarn install", () => {
      const result = mapCommand("yarn", { manager: "npm", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "yarn install" });
    });

    it("rewrites npm install <pkg> to yarn add <pkg>", () => {
      const result = mapCommand("yarn", { manager: "npm", command: "install", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn add lodash" });
    });

    it("rewrites npm run <script> to yarn run <script>", () => {
      const result = mapCommand("yarn", { manager: "npm", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn run build" });
    });

    it("rewrites npx <pkg> to yarn dlx <pkg>", () => {
      const result = mapCommand("yarn", { manager: "npm", command: "npx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn dlx create-react-app" });
    });
  });

  describe("npm to pnpm", () => {
    it("rewrites npm install to pnpm install", () => {
      const result = mapCommand("pnpm", { manager: "npm", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm install" });
    });

    it("rewrites npm install <pkg> to pnpm add <pkg>", () => {
      const result = mapCommand("pnpm", { manager: "npm", command: "install", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm add lodash" });
    });

    it("rewrites npm run <script> to pnpm run <script>", () => {
      const result = mapCommand("pnpm", { manager: "npm", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm run build" });
    });

    it("rewrites npx <pkg> to pnpx <pkg>", () => {
      const result = mapCommand("pnpm", { manager: "npm", command: "npx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpx create-react-app" });
    });
  });

  describe("yarn to npm", () => {
    it("rewrites yarn install to npm install", () => {
      const result = mapCommand("npm", { manager: "yarn", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "npm install" });
    });

    it("rewrites yarn add <pkg> to npm add <pkg>", () => {
      const result = mapCommand("npm", { manager: "yarn", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "npm add lodash" });
    });

    it("rewrites yarn run <script> to npm run <script>", () => {
      const result = mapCommand("npm", { manager: "yarn", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "npm run build" });
    });

    it("rewrites yarn dlx <pkg> to npx <pkg>", () => {
      const result = mapCommand("npm", { manager: "yarn", command: "yarn dlx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "npx create-react-app" });
    });
  });

  describe("yarn to bun", () => {
    it("rewrites yarn install to bun install", () => {
      const result = mapCommand("bun", { manager: "yarn", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "bun install" });
    });

    it("rewrites yarn add <pkg> to bun add <pkg>", () => {
      const result = mapCommand("bun", { manager: "yarn", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "bun add lodash" });
    });

    it("rewrites yarn run <script> to bun run <script>", () => {
      const result = mapCommand("bun", { manager: "yarn", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "bun run build" });
    });

    it("rewrites yarn dlx <pkg> to bunx <pkg>", () => {
      const result = mapCommand("bun", { manager: "yarn", command: "yarn dlx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "bunx create-react-app" });
    });
  });

  describe("yarn to pnpm", () => {
    it("rewrites yarn install to pnpm install", () => {
      const result = mapCommand("pnpm", { manager: "yarn", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm install" });
    });

    it("rewrites yarn add <pkg> to pnpm add <pkg>", () => {
      const result = mapCommand("pnpm", { manager: "yarn", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm add lodash" });
    });

    it("rewrites yarn run <script> to pnpm run <script>", () => {
      const result = mapCommand("pnpm", { manager: "yarn", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm run build" });
    });

    it("rewrites yarn dlx <pkg> to pnpx <pkg>", () => {
      const result = mapCommand("pnpm", { manager: "yarn", command: "yarn dlx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpx create-react-app" });
    });
  });

  describe("pnpm to npm", () => {
    it("rewrites pnpm install to npm install", () => {
      const result = mapCommand("npm", { manager: "pnpm", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "npm install" });
    });

    it("rewrites pnpm add <pkg> to npm add <pkg>", () => {
      const result = mapCommand("npm", { manager: "pnpm", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "npm add lodash" });
    });

    it("rewrites pnpm run <script> to npm run <script>", () => {
      const result = mapCommand("npm", { manager: "pnpm", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "npm run build" });
    });

    it("rewrites pnpx <pkg> to npx <pkg>", () => {
      const result = mapCommand("npm", { manager: "pnpm", command: "pnpx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "npx create-react-app" });
    });
  });

  describe("pnpm to bun", () => {
    it("rewrites pnpm install to bun install", () => {
      const result = mapCommand("bun", { manager: "pnpm", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "bun install" });
    });

    it("rewrites pnpm add <pkg> to bun add <pkg>", () => {
      const result = mapCommand("bun", { manager: "pnpm", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "bun add lodash" });
    });

    it("rewrites pnpm run <script> to bun run <script>", () => {
      const result = mapCommand("bun", { manager: "pnpm", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "bun run build" });
    });

    it("rewrites pnpx <pkg> to bunx <pkg>", () => {
      const result = mapCommand("bun", { manager: "pnpm", command: "pnpx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "bunx create-react-app" });
    });
  });

  describe("pnpm to yarn", () => {
    it("rewrites pnpm install to yarn install", () => {
      const result = mapCommand("yarn", { manager: "pnpm", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "yarn install" });
    });

    it("rewrites pnpm add <pkg> to yarn add <pkg>", () => {
      const result = mapCommand("yarn", { manager: "pnpm", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn add lodash" });
    });

    it("rewrites pnpm run <script> to yarn run <script>", () => {
      const result = mapCommand("yarn", { manager: "pnpm", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn run build" });
    });

    it("rewrites pnpx <pkg> to yarn dlx <pkg>", () => {
      const result = mapCommand("yarn", { manager: "pnpm", command: "pnpx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn dlx create-react-app" });
    });
  });

  describe("bun to npm", () => {
    it("rewrites bun install to npm install", () => {
      const result = mapCommand("npm", { manager: "bun", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "npm install" });
    });

    it("rewrites bun add <pkg> to npm add <pkg>", () => {
      const result = mapCommand("npm", { manager: "bun", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "npm add lodash" });
    });

    it("rewrites bun run <script> to npm run <script>", () => {
      const result = mapCommand("npm", { manager: "bun", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "npm run build" });
    });

    it("rewrites bunx <pkg> to npx <pkg>", () => {
      const result = mapCommand("npm", { manager: "bun", command: "bunx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "npx create-react-app" });
    });
  });

  describe("bun to yarn", () => {
    it("rewrites bun install to yarn install", () => {
      const result = mapCommand("yarn", { manager: "bun", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "yarn install" });
    });

    it("rewrites bun add <pkg> to yarn add <pkg>", () => {
      const result = mapCommand("yarn", { manager: "bun", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn add lodash" });
    });

    it("rewrites bun run <script> to yarn run <script>", () => {
      const result = mapCommand("yarn", { manager: "bun", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn run build" });
    });

    it("rewrites bunx <pkg> to yarn dlx <pkg>", () => {
      const result = mapCommand("yarn", { manager: "bun", command: "bunx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "yarn dlx create-react-app" });
    });
  });

  describe("bun to pnpm", () => {
    it("rewrites bun install to pnpm install", () => {
      const result = mapCommand("pnpm", { manager: "bun", command: "install", args: [] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm install" });
    });

    it("rewrites bun add <pkg> to pnpm add <pkg>", () => {
      const result = mapCommand("pnpm", { manager: "bun", command: "add", args: ["lodash"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm add lodash" });
    });

    it("rewrites bun run <script> to pnpm run <script>", () => {
      const result = mapCommand("pnpm", { manager: "bun", command: "run", args: ["build"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpm run build" });
    });

    it("rewrites bunx <pkg> to pnpx <pkg>", () => {
      const result = mapCommand("pnpm", { manager: "bun", command: "bunx", args: ["create-react-app"] });
      expect(result).toEqual({ type: "rewrite", command: "pnpx create-react-app" });
    });
  });

  describe.each([
    ["bun", "npm", "publish"],
    ["npm", "yarn", "publish"],
    ["pnpm", "npm", "publish"],
    ["yarn", "bun", "publish"],
  ])("unsupported commands", (target, source, command) => {
    it(`blocks ${source} ${command} in ${target} project`, () => {
      const result = mapCommand(target, { manager: source, command, args: [] });
      expect(result).toEqual({ type: "block", reason: `Unsupported command: ${command}` });
    });
  });
});