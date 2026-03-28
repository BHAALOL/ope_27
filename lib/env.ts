/**
 * Validates required environment variables at startup.
 * Import this in instrumentation.ts or layout.tsx to fail fast.
 */

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
] as const;

const optionalEnvVars = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "PERPLEXITY_API_KEY",
  "ADMIN_PASSWORD",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join("\n")}\n\nCheck your .env file or environment configuration.`
    );
  }

  // Warn about optional but recommended vars
  if (process.env.NODE_ENV === "production") {
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        console.warn(`[env] Optional variable ${envVar} is not set.`);
      }
    }
  }
}
