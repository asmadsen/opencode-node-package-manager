export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export type DetectionResult =
  | { manager: PackageManager; source: string }
  | { error: true; message: string }
  | null;

const LOCKFILES: Record<string, PackageManager> = {
  "bun.lock": "bun",
  "bun.lockb": "bun",
  "yarn.lock": "yarn",
  "pnpm-lock.yaml": "pnpm",
  "package-lock.json": "npm",
};

export async function detectPackageManager(
  directory: string,
  shell: (strings: TemplateStringsArray, ...expressions: any[]) => {
    text(): Promise<string>;
  }
): Promise<DetectionResult> {
  const packageJsonPath = `${directory}/package.json`;

  let packageJsonContent: string | null = null;
  try {
    packageJsonContent = await shell`cat ${packageJsonPath}`.text();
  } catch {
    packageJsonContent = null;
  }

  const detectionFromPackageJson = parsePackageJson(packageJsonContent);
  if (detectionFromPackageJson) {
    return detectionFromPackageJson;
  }

  const lockfiles: string[] = [];
  for (const lockfile of Object.keys(LOCKFILES)) {
    const lockfilePath = `${directory}/${lockfile}`;
    let exists = false;
    try {
      await shell`test -f ${lockfilePath}`;
      exists = true;
    } catch {
      exists = false;
    }
    if (exists) {
      lockfiles.push(lockfile);
    }
  }

  if (lockfiles.length > 1) {
    return {
      error: true,
      message: `Multiple lockfiles found (${lockfiles.join(", ")}). Please set the "packageManager" field in package.json explicitly.`,
    };
  }

  if (lockfiles.length === 1) {
    const lockfile = lockfiles[0]!;
    const manager = LOCKFILES[lockfile]!;
    return { manager, source: `detected from ${lockfile}` };
  }

  return null;
}

export function parsePackageJson(content: string | null): DetectionResult {
  if (!content) {
    return null;
  }

  try {
    const packageJson = JSON.parse(content);

    if (packageJson.packageManager) {
      const manager = normalizeManager(packageJson.packageManager);
      if (manager) {
        return { manager, source: "packageManager field in package.json" };
      }
    }

    if (packageJson.devEngines?.packageManager) {
      const manager = normalizeManager(packageJson.devEngines.packageManager);
      if (manager) {
        return { manager, source: "devEngines.packageManager field in package.json" };
      }
    }
  } catch {
  }

  return null;
}

function normalizeManager(value: string): PackageManager | null {
  const lower = value.toLowerCase();

  if (lower.startsWith("npm@") || lower === "npm") return "npm";
  if (lower.startsWith("yarn@") || lower === "yarn") return "yarn";
  if (lower.startsWith("pnpm@") || lower === "pnpm") return "pnpm";
  if (lower.startsWith("bun@") || lower === "bun") return "bun";

  return null;
}