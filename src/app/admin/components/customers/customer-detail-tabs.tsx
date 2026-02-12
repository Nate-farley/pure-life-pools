'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, MessageSquare, FileText, StickyNote } from 'lucide-react';
import { PropertyList } from '@/components/properties/property-list';
import { NoteList } from '@/components/notes/note-list';
import { EstimateList } from '@/components/estimates/estimate-list';
import type { CustomerWithDetails, EstimateWithDetails } from '@/lib/types/customer';
import type { Property, Pool, CustomerNote } from '@/lib/types/database';
import { CommunicationList } from '../communications/communication-list';

/**
 * Customer Detail Tabs Component
 *
 * Tabbed navigation for customer-related content:
 * - Properties: List of properties with pool details (fully implemented)
 * - Communications: Communication history log (placeholder)
 * - Estimates: List of estimates for this customer (fully implemented)
 * - Notes: Customer notes with author tracking (fully implemented)
 */

interface PropertyWithPool extends Property {
  pool: Pool | null;
}

interface NoteWithAuthor extends CustomerNote {
  author: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

interface CustomerDetailTabsProps {
  customer: CustomerWithDetails;
}

export function CustomerDetailTabs({ customer }: CustomerDetailTabsProps) {
  // Count items for tab badges
  const propertiesCount = customer.properties?.length ?? 0;
  const communicationsCount = customer.communications?.length ?? 0;
  const estimatesCount = customer.estimates?.length ?? 0;
  const notesCount = customer.notes?.length ?? 0;

  return (
    <Tabs defaultValue="properties" className="w-full">
      <TabsList className="w-full justify-start border-b border-zinc-200 bg-transparent p-0 h-auto">
        <TabsTrigger
          value="properties"
          className="relative px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 transition-colors"
        >
          <Building2 className="w-4 h-4 mr-2" />
          Properties
          {propertiesCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded-full">
              {propertiesCount}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="communications"
          className="relative px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 transition-colors"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Communications
          {communicationsCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded-full">
              {communicationsCount}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="estimates"
          className="relative px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          Estimates
          {estimatesCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded-full">
              {estimatesCount}
            </span>
          )}
        </TabsTrigger>

        <TabsTrigger
          value="notes"
          className="relative px-4 py-3 text-sm font-medium text-zinc-600 hover:text-zinc-900 data-[state=active]:text-zinc-900 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 transition-colors"
        >
          <StickyNote className="w-4 h-4 mr-2" />
          Notes
          {notesCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded-full">
              {notesCount}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      {/* Properties Tab Content - Fully Implemented with Pool Management */}
      <TabsContent value="properties" className="mt-6">
        <PropertyList
          customerId={customer.id}
          initialProperties={(customer.properties ?? []) as PropertyWithPool[]}
        />
      </TabsContent>

      {/* Communications Tab Content - Placeholder */}
      <TabsContent value="communications" className="mt-6">
      <CommunicationList
          customerId={customer.id}
          customerName={customer.name}
          initialCommunications={
            (customer.communications ?? []) as CommunicationWithLogger[]
          }
        />
      </TabsContent>

      {/* Estimates Tab Content - Fully Implemented */}
      <TabsContent value="estimates" className="mt-6">
        <EstimateList
          customerId={customer.id}
          initialEstimates={(customer.estimates ?? []) as EstimateWithDetails[]}
          showCustomer={false}
          variant="cards"
        />
      </TabsContent>

      {/* Notes Tab Content - Fully Implemented */}
      <TabsContent value="notes" className="mt-6">
        <NoteList
          customerId={customer.id}
          initialNotes={(customer.notes ?? []) as NoteWithAuthor[]}
        />
      </TabsContent>
    </Tabs>
  );
}

/**
 * Empty Tab State Component
 */
interface EmptyTabStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
}

function EmptyTabState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyTabStateProps) {
  const ActionButton = () => {
    if (actionHref) {
      return (
        <a
          href={actionHref}
          className="inline-flex items-center justify-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
        >
          {actionLabel}
        </a>
      );
    }

    return (
      <button
        onClick={onAction}
        className="inline-flex items-center justify-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
      >
        {actionLabel}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-zinc-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-zinc-900 mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm">{description}</p>
      <ActionButton />
    </div>
  );
}
