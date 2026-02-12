/**
 * Calendar Page Header
 *
 * @file src/app/(dashboard)/calendar/calendar-page-header.tsx
 *
 * Header component for the calendar page with title and create event button.
 */

'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateEventModal } from '@/components/calendar';

export function CalendarPageHeader() {
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Calendar</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Schedule and manage appointments and follow-ups
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {showCreateModal && (
        <CreateEventModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onCreated={() => {
            // Events will be refetched by the calendar
          }}
        />
      )}
    </>
  );
}
