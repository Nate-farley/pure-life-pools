/**
 * Estimates Empty State
 *
 * Shown when there are no estimates in the system.
 */

import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

export function EstimatesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-zinc-200 rounded-lg">
      <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <FileText className="w-7 h-7 text-zinc-400" />
      </div>
      <h3 className="text-base font-medium text-zinc-900 mb-1">
        No estimates yet
      </h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">
        Create your first estimate to start tracking quotes and proposals for your customers.
      </p>
      <Link
        href="/admin/estimates/new"
        className="inline-flex items-center justify-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white text-sm font-medium rounded-md transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Estimate
      </Link>
    </div>
  );
}
