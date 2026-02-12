/**
 * Calendar Page
 *
 * @file src/app/(dashboard)/admin/calendar/page.tsx
 *
 * Main calendar view for scheduling appointments and follow-ups.
 * Server component that renders the calendar with initial data.
 */

import { Suspense } from 'react';
import { PoolCalendar, CalendarLegend } from '@/components/calendar';
import { CalendarPageHeader } from './calendar-page-header';
import { CalendarSkeleton } from './calendar-skeleton';

// =============================================================================
// Metadata
// =============================================================================

export const metadata = {
  title: 'Calendar | Pool Service CRM',
  description: 'Schedule and manage appointments and follow-ups',
};

// =============================================================================
// Page Component
// =============================================================================

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <CalendarPageHeader />

      {/* Legend */}
      <CalendarLegend className="px-1" />

      {/* Calendar */}
      <Suspense fallback={<CalendarSkeleton />}>
        <div className="bg-white border border-zinc-200 rounded-lg p-4">
          <PoolCalendar />
        </div>
      </Suspense>
    </div>
  );
}

export const dynamic = 'force-dynamic';
