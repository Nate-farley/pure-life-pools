/**
 * Note Validation Schemas
 *
 * Zod schemas for customer note input validation.
 * These are the source of truth for both runtime validation and TypeScript types.
 */

import { z } from 'zod';

/**
 * Create Note Schema
 *
 * Validates input for creating a new customer note.
 */
export const createNoteSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(10000, 'Note content must be 10,000 characters or less')
    .trim(),
});

/**
 * Update Note Schema
 *
 * Validates input for updating an existing note.
 */
export const updateNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'Note content is required')
    .max(10000, 'Note content must be 10,000 characters or less')
    .trim(),
});

/**
 * TypeScript types inferred from schemas
 */
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/**
 * Format relative time for display
 *
 * @param dateString - ISO date string
 * @returns Human-readable relative time like "2 hours ago" or "Jan 15, 2025"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else {
    // Format as date for older notes
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Format full timestamp for display
 *
 * @param dateString - ISO date string
 * @returns Full formatted date like "January 15, 2025 at 2:30 PM"
 */
export function formatFullTimestamp(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
