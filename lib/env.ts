/**
 * Environment variable validation for production readiness.
 * Validates required variables at startup.
 */

export function validateEnv() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required for core functionality
  if (!process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required");
  }

  if (!process.env.NEXTAUTH_SECRET) {
    errors.push("NEXTAUTH_SECRET is required");
  } else if (process.env.NEXTAUTH_SECRET.length < 32) {
    errors.push("NEXTAUTH_SECRET must be at least 32 characters");
  }

  if (process.env.NODE_ENV === "production") {
    if (!process.env.NEXTAUTH_URL) {
      errors.push("NEXTAUTH_URL is required in production");
    }

    if (
      process.env.NEXTAUTH_SECRET ===
      "your-nextauth-secret-min-32-chars-change-in-production"
    ) {
      errors.push(
        "NEXTAUTH_SECRET must be changed from the default value in production"
      );
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      warnings.push("NEXT_PUBLIC_SITE_URL is not set — sitemap and SEO may not work correctly");
    }
  }

  // Optional service keys — warn if missing
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    warnings.push(
      "Neither ANTHROPIC_API_KEY nor OPENAI_API_KEY is set — AI generation will be unavailable"
    );
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Environment warnings:");
    warnings.forEach((w) => console.warn(`   - ${w}`));
  }

  if (errors.length > 0) {
    console.error("❌ Environment validation failed:");
    errors.forEach((e) => console.error(`   - ${e}`));
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Environment validation failed: ${errors.join(", ")}`);
    }
  }
}
