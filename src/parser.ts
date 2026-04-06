export type ParsedCommand = {
  manager: string;
  command: string;
  args: string[];
};

export function parseCommand(command: string): ParsedCommand | null {
  const trimmed = command.trim();
  const parts = tokenize(trimmed);

  if (parts.length === 0) {
    return null;
  }

  const [first, second, ...rest] = parts;

  if (first === "npx") {
    return { manager: "npm", command: "npx", args: [second!, ...rest] };
  }

  if (first === "bunx") {
    return { manager: "bun", command: "bunx", args: [second!, ...rest] };
  }

  if (first === "pnpx") {
    return { manager: "pnpm", command: "pnpx", args: [second!, ...rest] };
  }

  if (first === "yarn" && second === "dlx") {
    return { manager: "yarn", command: "yarn dlx", args: rest };
  }

  if (first === "npm" || first === "yarn" || first === "pnpm" || first === "bun") {
    return { manager: first, command: second || "", args: rest };
  }

  return null;
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaping = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (escaping) {
      current += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      escaping = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === " " && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}