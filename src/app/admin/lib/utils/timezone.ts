/**
 * Timezone Utilities
 *
 * @file src/lib/utils/timezone.ts
 *
 * Utilities for handling timezone conversions between UTC (storage)
 * and local display time. Uses the DEFAULT_TIMEZONE environment variable
 * or falls back to America/New_York.
 */

import {
  format,
  formatInTimeZone,
  toZonedTime,
  fromZonedTime,
} from 'date-fns-tz';
import {
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addHours,
  addMinutes,
  differenceInMinutes,
  isSameDay,
  isToday,
  isTomorrow,
  isYesterday,
} from 'date-fns';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Default timezone for the application
 * Can be overridden via DEFAULT_TIMEZONE environment variable
 */
export const DEFAULT_TIMEZONE =
  process.env.DEFAULT_TIMEZONE || process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || 'America/New_York';

/**
 * Common timezone options for UI selection
 */
export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (MST)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
] as const;

// =============================================================================
// Core Conversion Functions
// =============================================================================

/**
 * Converts a UTC date to the display timezone
 *
 * @param utcDate - Date in UTC (string or Date object)
 * @param timezone - Target timezone (defaults to DEFAULT_TIMEZONE)
 * @returns Date object in the target timezone
 */
export function toLocalTime(
  utcDate: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  if (!isValid(date)) {
    throw new Error(`Invalid date: ${utcDate}`);
  }
  return toZonedTime(date, timezone);
}

/**
 * Converts a local time to UTC for storage
 *
 * @param localDate - Date in local timezone
 * @param timezone - Source timezone (defaults to DEFAULT_TIMEZONE)
 * @returns Date object in UTC
 */
export function toUTC(
  localDate: Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  return fromZonedTime(localDate, timezone);
}

/**
 * Converts a local datetime string to an ISO UTC string
 *
 * @param localDatetime - Local datetime string (YYYY-MM-DDTHH:mm)
 * @param timezone - Source timezone
 * @returns ISO 8601 UTC string
 */
export function localToUTCString(
  localDatetime: string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  // Parse the local datetime
  const localDate = parseISO(localDatetime);
  if (!isValid(localDate)) {
    throw new Error(`Invalid datetime: ${localDatetime}`);
  }

  // Convert to UTC
  const utcDate = fromZonedTime(localDate, timezone);

  // Return as ISO string
  return utcDate.toISOString();
}

/**
 * Converts a UTC string to a local datetime string for form inputs
 *
 * @param utcString - ISO 8601 UTC string
 * @param timezone - Target timezone
 * @returns Local datetime string (YYYY-MM-DDTHH:mm)
 */
export function utcToLocalString(
  utcString: string,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const utcDate = parseISO(utcString);
  if (!isValid(utcDate)) {
    throw new Error(`Invalid UTC string: ${utcString}`);
  }

  return formatInTimeZone(utcDate, timezone, "yyyy-MM-dd'T'HH:mm");
}

// =============================================================================
// Formatting Functions
// =============================================================================

/**
 * Format options for different display contexts
 */
export const DATE_FORMATS = {
  // Full formats
  full: 'EEEE, MMMM d, yyyy', // Monday, January 15, 2025
  fullWithTime: "EEEE, MMMM d, yyyy 'at' h:mm a", // Monday, January 15, 2025 at 2:30 PM
  fullWithTimezone: "EEEE, MMMM d, yyyy 'at' h:mm a zzz", // ... at 2:30 PM EST

  // Medium formats
  medium: 'MMM d, yyyy', // Jan 15, 2025
  mediumWithTime: "MMM d, yyyy 'at' h:mm a", // Jan 15, 2025 at 2:30 PM

  // Short formats
  short: 'M/d/yyyy', // 1/15/2025
  shortWithTime: 'M/d/yyyy h:mm a', // 1/15/2025 2:30 PM

  // Time only
  time: 'h:mm a', // 2:30 PM
  time24: 'HH:mm', // 14:30

  // Date only
  dayMonth: 'MMM d', // Jan 15
  weekday: 'EEEE', // Monday
  weekdayShort: 'EEE', // Mon

  // Calendar specific
  calendarDay: 'd', // 15
  calendarMonth: 'MMMM yyyy', // January 2025
  calendarWeek: "'Week of' MMM d", // Week of Jan 15

  // Form inputs
  inputDate: 'yyyy-MM-dd', // 2025-01-15
  inputDateTime: "yyyy-MM-dd'T'HH:mm", // 2025-01-15T14:30
} as const;

/**
 * Formats a UTC datetime for display in the local timezone
 *
 * @param utcDate - Date in UTC (string or Date)
 * @param formatStr - Format string from DATE_FORMATS or custom
 * @param timezone - Display timezone
 * @returns Formatted date string
 */
export function formatDateTime(
  utcDate: string | Date,
  formatStr: keyof typeof DATE_FORMATS | string = 'mediumWithTime',
  timezone: string = DEFAULT_TIMEZONE
): string {
  const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  if (!isValid(date)) {
    return 'Invalid date';
  }

  const pattern = DATE_FORMATS[formatStr as keyof typeof DATE_FORMATS] ?? formatStr;
  return formatInTimeZone(date, timezone, pattern);
}

/**
 * Formats a time range for display (e.g., "2:30 PM - 3:30 PM")
 *
 * @param startUtc - Start time in UTC
 * @param endUtc - End time in UTC
 * @param timezone - Display timezone
 * @returns Formatted time range string
 */
export function formatTimeRange(
  startUtc: string | Date,
  endUtc: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const start = formatDateTime(startUtc, 'time', timezone);
  const end = formatDateTime(endUtc, 'time', timezone);
  return `${start} - ${end}`;
}

/**
 * Formats a date range for display
 * Handles same-day ranges intelligently
 *
 * @param startUtc - Start datetime in UTC
 * @param endUtc - End datetime in UTC
 * @param timezone - Display timezone
 * @returns Formatted date range string
 */
export function formatDateRange(
  startUtc: string | Date,
  endUtc: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const startDate = typeof startUtc === 'string' ? parseISO(startUtc) : startUtc;
  const endDate = typeof endUtc === 'string' ? parseISO(endUtc) : endUtc;

  const startLocal = toLocalTime(startDate, timezone);
  const endLocal = toLocalTime(endDate, timezone);

  if (isSameDay(startLocal, endLocal)) {
    // Same day: "Jan 15, 2025 • 2:30 PM - 3:30 PM"
    return `${formatDateTime(startUtc, 'medium', timezone)} • ${formatTimeRange(startUtc, endUtc, timezone)}`;
  }

  // Different days: "Jan 15, 2025 2:30 PM - Jan 16, 2025 3:30 PM"
  return `${formatDateTime(startUtc, 'mediumWithTime', timezone)} - ${formatDateTime(endUtc, 'mediumWithTime', timezone)}`;
}

/**
 * Get a relative date label (Today, Tomorrow, Yesterday, or formatted date)
 *
 * @param utcDate - Date in UTC
 * @param timezone - Display timezone
 * @returns Relative or formatted date string
 */
export function getRelativeDateLabel(
  utcDate: string | Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  const localDate = toLocalTime(utcDate, timezone);
  const now = toLocalTime(new Date(), timezone);

  if (isSameDay(localDate, now)) {
    return 'Today';
  }

  if (isTomorrow(localDate)) {
    return 'Tomorrow';
  }

  if (isYesterday(localDate)) {
    return 'Yesterday';
  }

  // Check if it's this week
  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 0 });
  const endOfThisWeek = endOfWeek(now, { weekStartsOn: 0 });

  if (localDate >= startOfThisWeek && localDate <= endOfThisWeek) {
    return formatDateTime(utcDate, 'weekday', timezone);
  }

  // Otherwise, return medium format
  return formatDateTime(utcDate, 'medium', timezone);
}

// =============================================================================
// Calendar View Helpers
// =============================================================================

/**
 * Get the start of day in UTC for a local date
 *
 * @param localDate - Date in local timezone
 * @param timezone - Local timezone
 * @returns UTC Date representing start of that local day
 */
export function getStartOfDayUTC(
  localDate: Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const localStartOfDay = startOfDay(localDate);
  return fromZonedTime(localStartOfDay, timezone);
}

/**
 * Get the end of day in UTC for a local date
 *
 * @param localDate - Date in local timezone
 * @param timezone - Local timezone
 * @returns UTC Date representing end of that local day
 */
export function getEndOfDayUTC(
  localDate: Date,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  const localEndOfDay = endOfDay(localDate);
  return fromZonedTime(localEndOfDay, timezone);
}

/**
 * Get start and end of a calendar view range in UTC
 *
 * @param viewStart - Start of visible calendar range (local)
 * @param viewEnd - End of visible calendar range (local)
 * @param timezone - Local timezone
 * @returns Object with start and end as UTC ISO strings
 */
export function getCalendarRangeUTC(
  viewStart: Date,
  viewEnd: Date,
  timezone: string = DEFAULT_TIMEZONE
): { start: string; end: string } {
  return {
    start: getStartOfDayUTC(viewStart, timezone).toISOString(),
    end: getEndOfDayUTC(viewEnd, timezone).toISOString(),
  };
}

/**
 * Get the default time slot for a new event
 * Rounds to the next 30-minute mark
 *
 * @param timezone - Local timezone
 * @returns Object with start and end times as ISO strings
 */
export function getDefaultEventTimes(
  timezone: string = DEFAULT_TIMEZONE
): { start: string; end: string } {
  const now = new Date();
  const localNow = toLocalTime(now, timezone);

  // Round to next 30-minute mark
  const minutes = localNow.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 30) * 30;
  const adjustedMinutes = roundedMinutes - minutes;

  const start = addMinutes(localNow, adjustedMinutes);
  const end = addHours(start, 1); // Default 1 hour duration

  return {
    start: fromZonedTime(start, timezone).toISOString(),
    end: fromZonedTime(end, timezone).toISOString(),
  };
}

/**
 * Calculate event duration in minutes
 *
 * @param startUtc - Start time in UTC
 * @param endUtc - End time in UTC
 * @returns Duration in minutes
 */
export function getEventDuration(startUtc: string | Date, endUtc: string | Date): number {
  const start = typeof startUtc === 'string' ? parseISO(startUtc) : startUtc;
  const end = typeof endUtc === 'string' ? parseISO(endUtc) : endUtc;
  return differenceInMinutes(end, start);
}

/**
 * Format duration for display
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "1h 30m" or "45m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

// =============================================================================
// Timezone Detection
// =============================================================================

/**
 * Get the user's browser timezone
 * Only call this on the client side
 *
 * @returns IANA timezone string or undefined if unavailable
 */
export function getBrowserTimezone(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/**
 * Get timezone abbreviation for display
 *
 * @param timezone - IANA timezone string
 * @param date - Date to get abbreviation for (affects DST)
 * @returns Timezone abbreviation (e.g., "EST", "EDT")
 */
export function getTimezoneAbbreviation(
  timezone: string = DEFAULT_TIMEZONE,
  date: Date = new Date()
): string {
  return formatInTimeZone(date, timezone, 'zzz');
}

/**
 * Get timezone offset string for display
 *
 * @param timezone - IANA timezone string
 * @param date - Date to get offset for
 * @returns Offset string (e.g., "UTC-5")
 */
export function getTimezoneOffset(
  timezone: string = DEFAULT_TIMEZONE,
  date: Date = new Date()
): string {
  return formatInTimeZone(date, timezone, 'xxx');
}
