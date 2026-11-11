import { createNeonAuth } from "@neondatabase/auth/next/server";

function requiredEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

export function getNeonAuth() {
  return createNeonAuth({
    baseUrl: requiredEnvironmentVariable("NEON_AUTH_BASE_URL"),
    cookies: {
      secret: requiredEnvironmentVariable("NEON_AUTH_COOKIE_SECRET"),
    },
  });
}
