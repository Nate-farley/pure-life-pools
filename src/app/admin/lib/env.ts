import { z } from 'zod';

/**
 * Server-side environment variables schema.
 * These are validated at build time and runtime.
 */
const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  DEFAULT_TIMEZONE: z.string().default('America/New_York'),

  // Email (optional for development)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Client-side environment variables schema.
 * Only NEXT_PUBLIC_ prefixed variables are available on the client.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates and returns server-side environment variables.
 * Call this in server components and API routes.
 */
function validateServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      '❌ Invalid server environment variables:',
      parsed.error.flatten().fieldErrors
    );
    throw new Error('Invalid server environment variables');
  }

  return parsed.data;
}

/**
 * Validates and returns client-side environment variables.
 * Safe to use in client components.
 */
function validateClientEnv(): ClientEnv {
  const clientVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
  };

  const parsed = clientEnvSchema.safeParse(clientVars);

  if (!parsed.success) {
    console.error(
      '❌ Invalid client environment variables:',
      parsed.error.flatten().fieldErrors
    );
    throw new Error('Invalid client environment variables');
  }

  return parsed.data;
}

/**
 * Server environment singleton.
 * Validated once and cached for the lifetime of the server.
 */
export const serverEnv = validateServerEnv();

/**
 * Client environment singleton.
 * Only includes NEXT_PUBLIC_ variables safe for browser exposure.
 */
export const clientEnv = validateClientEnv();
