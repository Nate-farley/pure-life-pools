/**
 * Calendar Legend Component
 *
 * @file src/components/admin/calendar/admin/calendar-legend.tsx
 *
 * Displays the color legend for event types and statuses.
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { EVENT_TYPE_COLORS, EVENT_STATUS_STYLES } from '@/lib/types/calendar';
import { eventTypeOptions, eventStatusOptions } from '@/lib/validations/calendar';

// =============================================================================
// Types
// =============================================================================

interface CalendarLegendProps {
  /** Show event types */
  showTypes?: boolean;
  /** Show statuses */
  showStatuses?: boolean;
  /** Compact layout */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function CalendarLegend({
  showTypes = true,
  showStatuses = true,
  compact = false,
  className,
}: CalendarLegendProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-4',
        compact ? 'gap-3 text-xs' : 'gap-4 text-sm',
        className
      )}
    >
      {/* Event Types */}
      {showTypes && (
        <div className={cn('flex flex-wrap items-center', compact ? 'gap-2' : 'gap-3')}>
          {!compact && (
            <span className="text-zinc-500 font-medium mr-1">Types:</span>
          )}
          {eventTypeOptions.map((option) => {
            const colors = EVENT_TYPE_COLORS[option.value];
            return (
              <div key={option.value} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'rounded',
                    compact ? 'w-3 h-3' : 'w-4 h-4'
                  )}
                  style={{
                    backgroundColor: colors.background,
                    border: `2px solid ${colors.border}`,
                  }}
                />
                <span className="text-zinc-700">{option.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      {showTypes && showStatuses && (
        <div className="w-px bg-zinc-200 self-stretch" />
      )}

      {/* Statuses */}
      {showStatuses && (
        <div className={cn('flex flex-wrap items-center', compact ? 'gap-2' : 'gap-3')}>
          {!compact && (
            <span className="text-zinc-500 font-medium mr-1">Status:</span>
          )}
          {eventStatusOptions.map((option) => {
            const styles = EVENT_STATUS_STYLES[option.value];
            return (
              <div key={option.value} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'rounded-full',
                    compact ? 'w-2 h-2' : 'w-2.5 h-2.5'
                  )}
                  style={{
                    backgroundColor: styles.dotColor,
                    opacity: styles.opacity,
                  }}
                />
                <span
                  className="text-zinc-700"
                  style={{ opacity: styles.opacity }}
                >
                  {option.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
