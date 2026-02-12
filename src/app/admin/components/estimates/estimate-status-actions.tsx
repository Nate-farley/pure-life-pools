'use client';

/**
 * Estimate Status Actions
 *
 * Component for transitioning estimate status through the workflow.
 * Shows available next statuses as action buttons.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle, XCircle, FileCheck, RefreshCw } from 'lucide-react';
import {
  getAllowedNextStatuses,
  type EstimateStatus,
} from '@/lib/validations/estimate';
import { updateEstimateStatus } from '@/app/actions/estimates';

// ============================================================================
// Configuration
// ============================================================================

const statusActions: Record<
  EstimateStatus,
  {
    icon: typeof Send;
    label: string;
    description: string;
    className: string;
  }
> = {
  draft: {
    icon: Send,
    label: 'Mark as Sent',
    description: 'Indicates the estimate has been shared with the customer',
    className: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  sent: {
    icon: Send,
    label: 'Sent',
    description: '',
    className: '',
  },
  internal_final: {
    icon: FileCheck,
    label: 'Mark as Final',
    description: 'Internal approval is complete',
    className: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  converted: {
    icon: CheckCircle,
    label: 'Mark as Converted',
    description: 'Customer has accepted this estimate',
    className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  declined: {
    icon: XCircle,
    label: 'Mark as Declined',
    description: 'Customer has declined this estimate',
    className: 'bg-red-600 hover:bg-red-700 text-white',
  },
};

// ============================================================================
// Component
// ============================================================================

interface EstimateStatusActionsProps {
  estimateId: string;
  currentStatus: EstimateStatus;
}

export function EstimateStatusActions({
  estimateId,
  currentStatus,
}: EstimateStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<EstimateStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowedStatuses = getAllowedNextStatuses(currentStatus);

  const handleStatusChange = async (newStatus: EstimateStatus) => {
    setIsUpdating(newStatus);
    setError(null);

    try {
const result = await updateEstimateStatus(estimateId, { status: newStatus });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Refresh the page to show updated status
      router.refresh();
    } catch (err) {
      setError('Failed to update status');
      console.error('Status update error:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  if (allowedStatuses.length === 0) {
    // No actions available for this status
    if (currentStatus === 'converted') {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <p className="text-sm text-emerald-700">
            This estimate has been converted. No further actions available.
          </p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <XCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-zinc-500">Update Status:</span>

        {allowedStatuses.map((status) => {
          const config = statusActions[status];
          const Icon = status === 'declined' ? XCircle :
                       status === 'converted' ? CheckCircle :
                       status === 'internal_final' ? FileCheck :
                       status === 'draft' ? RefreshCw : Send;
          const isLoading = isUpdating === status;

          // Determine button styling based on target status
          let buttonClass = 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300';
          if (status === 'sent') {
            buttonClass = 'bg-blue-600 hover:bg-blue-700 text-white border-transparent';
          } else if (status === 'converted') {
            buttonClass = 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent';
          } else if (status === 'declined') {
            buttonClass = 'bg-white hover:bg-red-50 text-red-600 border border-red-300 hover:border-red-400';
          } else if (status === 'internal_final') {
            buttonClass = 'bg-amber-600 hover:bg-amber-700 text-white border-transparent';
          }

          // Button label based on target status
          let label = 'Update';
          if (status === 'sent') label = 'Mark as Sent';
          else if (status === 'converted') label = 'Mark Converted';
          else if (status === 'declined') label = 'Mark Declined';
          else if (status === 'internal_final') label = 'Mark Final';
          else if (status === 'draft') label = 'Reopen as Draft';

          return (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating !== null}
              className={`inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${buttonClass}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {isLoading ? 'Updating...' : label}
            </button>
          );
        })}
      </div>

      {/* Workflow hint */}
      {currentStatus === 'draft' && (
        <p className="text-xs text-zinc-500">
          Mark as sent when you've shared this estimate with the customer.
        </p>
      )}
      {currentStatus === 'sent' && (
        <p className="text-xs text-zinc-500">
          Update the status when the customer responds or when internal approval is complete.
        </p>
      )}
    </div>
  );
}
