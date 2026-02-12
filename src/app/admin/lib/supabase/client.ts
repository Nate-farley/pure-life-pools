import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/supabase';

/**
 * Creates a Supabase client for use in Client Components.
 *
 * This client:
 * - Runs in the browser
 * - Manages session via cookies automatically
 * - Should be created once and reused
 *
 * @example
 * // In a Client Component
 * const supabase = createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
