export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

export function requireEnvOptional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function requireEnvAllowEmpty(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing ${name} environment variable.`);
  }

  return value;
}

export function requireEnvNumber(name: string): number {
  const value = requireEnv(name);
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric value for ${name}: ${value}`);
  }

  return parsed;
}
