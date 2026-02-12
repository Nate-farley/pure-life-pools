/**
 * Estimate Not Found Page
 *
 * Displayed when an estimate with the given ID doesn't exist
 * or the user doesn't have access to it.
 */

import Link from 'next/link';
import { FileX } from 'lucide-react';

export default function EstimateNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
        <FileX className="w-8 h-8 text-zinc-400" />
      </div>
      <h1 className="text-xl font-semibold text-zinc-900 mb-2">
        Estimate Not Found
      </h1>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">
        The estimate you&apos;re looking for doesn&apos;t exist or may have been deleted.
      </p>
      <Link
        href="/admin/estimates"
        className="inline-flex items-center justify-center h-9 px-4 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white text-sm font-medium rounded-md transition-colors"
      >
        Back to Estimates
      </Link>
    </div>
  );
}
