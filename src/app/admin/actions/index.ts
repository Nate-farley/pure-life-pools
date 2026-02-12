/**
 * Server Actions
 *
 * This directory contains all server actions organized by domain.
 * Each file exports functions that can be called from client components.
 *
 * Naming convention:
 * - {domain}.ts (e.g., customers.ts, calendar.ts, estimates.ts)
 *
 * All actions:
 * - Validate input with Zod schemas
 * - Call appropriate service methods
 * - Return ActionResult<T> type
 * - Revalidate affected paths after mutations
 */

export * from '@/lib/supabase'
