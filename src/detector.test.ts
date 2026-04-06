import { describe, it, expect } from "vitest";
import { detectPackageManager, parsePackageJson } from "./detector.js";

describe("parsePackageJson", () => {
  it("detects packageManager field from package.json", () => {
    const result = parsePackageJson(JSON.stringify({ packageManager: "npm@10.0.0" }));
    expect(result).toEqual({ manager: "npm", source: "packageManager field in package.json" });
  });

  it("detects devEngines.packageManager field", () => {
    const result = parsePackageJson(JSON.stringify({ devEngines: { packageManager: "yarn@4.0.0" } }));
    expect(result).toEqual({ manager: "yarn", source: "devEngines.packageManager field in package.json" });
  });

  it("prefers top-level packageManager over devEngines.packageManager", () => {
    const result = parsePackageJson(JSON.stringify({
      packageManager: "pnpm@8.0.0",
      devEngines: { packageManager: "yarn@4.0.0" },
    }));
    expect(result).toEqual({ manager: "pnpm", source: "packageManager field in package.json" });
  });

  it("returns null for empty package.json", () => {
    const result = parsePackageJson("{}");
    expect(result).toBeNull();
  });

  it("returns null for null input", () => {
    const result = parsePackageJson(null);
    expect(result).toBeNull();
  });

  it("handles invalid JSON", () => {
    const result = parsePackageJson("not valid json");
    expect(result).toBeNull();
  });

  it("detects bun packageManager", () => {
    const result = parsePackageJson(JSON.stringify({ packageManager: "bun@1.0.0" }));
    expect(result).toEqual({ manager: "bun", source: "packageManager field in package.json" });
  });

  it("detects yarn packageManager without version", () => {
    const result = parsePackageJson(JSON.stringify({ packageManager: "yarn" }));
    expect(result).toEqual({ manager: "yarn", source: "packageManager field in package.json" });
  });
});

describe("detectPackageManager", () => {
  const mockShell = (packageJsonContent: string | null, lockfiles: string[]) => {
    return (strings: TemplateStringsArray, ...expressions: any[]) => {
      const path = expressions[0] as string;

      if (path.endsWith("package.json")) {
        return {
          text: async () => packageJsonContent ?? "",
        };
      }

      const lockfile = lockfiles.find((lf) => path.endsWith(lf));
      if (lockfile) {
        return {
          then: (resolve: any, _reject: any) => resolve(true),
          catch: () => ({ then: () => {} }),
        };
      }

      return {
        then: (_resolve: any, reject: any) => reject(new Error("not found")),
        catch: () => ({ then: () => {} }),
      };
    };
  };

  it("detects bun lockfile", async () => {
    const shell = mockShell("{}", ["bun.lock"]);
    const result = await detectPackageManager("/test", shell as any);
    expect(result).toEqual({ manager: "bun", source: "detected from bun.lock" });
  });

  it("detects yarn lockfile", async () => {
    const shell = mockShell("{}", ["yarn.lock"]);
    const result = await detectPackageManager("/test", shell as any);
    expect(result).toEqual({ manager: "yarn", source: "detected from yarn.lock" });
  });

  it("detects pnpm lockfile", async () => {
    const shell = mockShell("{}", ["pnpm-lock.yaml"]);
    const result = await detectPackageManager("/test", shell as any);
    expect(result).toEqual({ manager: "pnpm", source: "detected from pnpm-lock.yaml" });
  });

  it("detects npm lockfile", async () => {
    const shell = mockShell("{}", ["package-lock.json"]);
    const result = await detectPackageManager("/test", shell as any);
    expect(result).toEqual({ manager: "npm", source: "detected from package-lock.json" });
  });

  it("returns error when multiple lockfiles found", async () => {
    const shell = mockShell("{}", ["bun.lock", "yarn.lock"]);
    const result = await detectPackageManager("/test", shell as any);
    expect(result).toEqual({
      error: true,
      message: "Multiple lockfiles found (bun.lock, yarn.lock). Please set the \"packageManager\" field in package.json explicitly.",
    });
  });

  it("returns null when no package manager detected", async () => {
    const shell = mockShell("{}", []);
    const result = await detectPackageManager("/test", shell as any);
    expect(result).toBeNull();
  });

  it("detects bun.lockb lockfile", async () => {
    const shell = mockShell("{}", ["bun.lockb"]);
    const result = await detectPackageManager("/test", shell as any);
    expect(result).toEqual({ manager: "bun", source: "detected from bun.lockb" });
  });
});