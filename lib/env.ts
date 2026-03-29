/**
 * Runtime environment variable validation.
 * Called once at app startup to fail fast on missing critical config.
 */

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

export function validateEnv() {
  const errors: string[] = [];

  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required");
  }
  if (!process.env.NEXTAUTH_SECRET) {
    errors.push("NEXTAUTH_SECRET is required");
  }
  if (!process.env.NEXTAUTH_URL) {
    errors.push("NEXTAUTH_URL is required");
  }

  if (errors.length > 0) {
    console.error("Environment validation failed:");
    errors.forEach((e) => console.error(`  - ${e}`));
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variables: ${errors.join(", ")}`);
    }
  }
}

export const env = {
  get DATABASE_URL() {
    return getRequiredEnv("DATABASE_URL");
  },
  get NEXTAUTH_SECRET() {
    return getRequiredEnv("NEXTAUTH_SECRET");
  },
  get NEXTAUTH_URL() {
    return getRequiredEnv("NEXTAUTH_URL");
  },
  get ANTHROPIC_API_KEY() {
    return getOptionalEnv("ANTHROPIC_API_KEY");
  },
  get OPENAI_API_KEY() {
    return getOptionalEnv("OPENAI_API_KEY");
  },
  get PERPLEXITY_API_KEY() {
    return getOptionalEnv("PERPLEXITY_API_KEY");
  },
  get NODE_ENV() {
    return getOptionalEnv("NODE_ENV", "development")!;
  },
  get isProduction() {
    return this.NODE_ENV === "production";
  },
};
