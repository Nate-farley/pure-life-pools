/**
 * Estimate Detail Page
 *
 * Server component that fetches and displays a single estimate.
 * Uses Suspense with EstimateDetailSkeleton for loading state.
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getEstimate } from '@/app/actions/estimates';
import { EstimateDetailSkeleton } from '@/components/estimates/estimate-detail-skeleton';
import { EstimateDetailContent } from '@/components/estimates/estimate-detail-content';
// ============================================================================
// Metadata
// ============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const result = await getEstimate(id);

  if (!result.success) {
    return {
      title: 'Estimate Not Found',
    };
  }

  return {
    title: `${result.data.estimate_number} | Estimates`,
    description: `Estimate for ${result.data.customer.name}`,
  };
}

// ============================================================================
// Content Component (fetches data)
// ============================================================================

async function EstimateContent({ id }: { id: string }) {
  const result = await getEstimate(id);

  if (!result.success) {
    notFound();
  }

  // @ts-ignore
  return <EstimateDetailContent  estimate={result.data} />;
}

// ============================================================================
// Page Component
// ============================================================================

export default async function EstimateDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm print:hidden">
        <Link
          href="/admin/estimates"
          className="text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Estimates
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
        <span className="text-zinc-900">View Estimate</span>
      </nav>

      {/* Content with Suspense */}
      <Suspense fallback={<EstimateDetailSkeleton />}>
        <EstimateContent id={id} />
      </Suspense>
    </div>
  );
}

export const dynamic = 'force-dynamic';
