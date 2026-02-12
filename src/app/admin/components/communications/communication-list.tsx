'use client';

/**
 * Communication List Component
 *
 * @file src/components/communications/communication-list.tsx
 *
 * Displays a paginated, filterable list of communications for a customer.
 * Includes type/direction filters, search, and date range filtering.
 */

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Phone,
  MessageSquare,
  Mail,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  listCommunications,
  deleteCommunication,
} from '@/app/actions/communications';
import type { CommunicationWithLogger } from '@/lib/types/communication';
import type { Communication } from '@/lib/types/database';
import { LogCommunicationModal } from './log-communication-modal';
import { EditCommunicationModal } from './edit-communication-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// =============================================================================
// Types
// =============================================================================

interface CommunicationListProps {
  customerId: string;
  customerName: string;
  initialCommunications?: CommunicationWithLogger[];
}

interface Filters {
  type: Communication['type'] | 'all';
  direction: Communication['direction'] | 'all';
  search: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getTypeIcon(type: Communication['type']) {
  switch (type) {
    case 'call':
      return <Phone className="w-4 h-4" />;
    case 'text':
      return <MessageSquare className="w-4 h-4" />;
    case 'email':
      return <Mail className="w-4 h-4" />;
  }
}

function getTypeColors(type: Communication['type']) {
  switch (type) {
    case 'call':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'text':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'email':
      return 'bg-amber-50 text-amber-700 border-amber-200';
  }
}

function getDirectionIcon(direction: Communication['direction']) {
  return direction === 'inbound' ? (
    <ArrowDownLeft className="w-3.5 h-3.5" />
  ) : (
    <ArrowUpRight className="w-3.5 h-3.5" />
  );
}

// =============================================================================
// Communication Item Component
// =============================================================================

interface CommunicationItemProps {
  communication: CommunicationWithLogger;
  onEdit: (communication: CommunicationWithLogger) => void;
  onDelete: (communication: CommunicationWithLogger) => void;
}

function CommunicationItem({ communication, onEdit, onDelete }: CommunicationItemProps) {
  const occurredDate = new Date(communication.occurred_at);
  const formattedDate = format(occurredDate, 'MMM d, yyyy');
  const formattedTime = format(occurredDate, 'h:mm a');
  const relativeTime = formatDistanceToNow(occurredDate, { addSuffix: true });

  return (
    <div className="group p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Type badge and content */}
        <div className="flex gap-3 min-w-0 flex-1">
          {/* Type Icon Badge */}
          <div
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg border flex-shrink-0',
              getTypeColors(communication.type)
            )}
          >
            {getTypeIcon(communication.type)}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Header row */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-zinc-900 capitalize">
                {communication.type}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded',
                  'bg-zinc-100 text-zinc-600'
                )}
              >
                {getDirectionIcon(communication.direction)}
                <span className="capitalize">{communication.direction}</span>
              </span>
            </div>

            {/* Summary */}
            <p className="text-sm text-zinc-600 whitespace-pre-wrap break-words">
              {communication.summary}
            </p>

            {/* Footer row */}
            <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
              <span title={`${formattedDate} at ${formattedTime}`}>
                {relativeTime}
              </span>
              {communication.logged_by_admin && (
                <>
                  <span>•</span>
                  <span>Logged by {communication.logged_by_admin.full_name}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(communication)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(communication)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Filter Bar Component
// =============================================================================

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClear: () => void;
  isFiltering: boolean;
}

function FilterBar({ filters, onFiltersChange, onClear, isFiltering }: FilterBarProps) {
  const hasFilters =
    filters.type !== 'all' || filters.direction !== 'all' || filters.search !== '';

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search communications..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Type Filter */}
      <Select
        value={filters.type}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, type: value as Filters['type'] })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="call">Calls</SelectItem>
          <SelectItem value="text">Texts</SelectItem>
          <SelectItem value="email">Emails</SelectItem>
        </SelectContent>
      </Select>

      {/* Direction Filter */}
      <Select
        value={filters.direction}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, direction: value as Filters['direction'] })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Direction" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Directions</SelectItem>
          <SelectItem value="inbound">Inbound</SelectItem>
          <SelectItem value="outbound">Outbound</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-zinc-500 hover:text-zinc-900"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}

      {/* Loading Indicator */}
      {isFiltering && (
        <div className="flex items-center text-zinc-400">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Empty State Component
// =============================================================================

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onLogCommunication: () => void;
}

function EmptyState({ hasFilters, onClearFilters, onLogCommunication }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
          <Filter className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-sm font-medium text-zinc-900 mb-1">No results found</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Try adjusting your filters or search query
        </p>
        <Button variant="secondary" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <MessageSquare className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-900 mb-1">
        No communications logged
      </h3>
      <p className="text-sm text-zinc-500 mb-4">
        Log calls, texts, and emails to keep track of customer interactions.
      </p>
      <Button onClick={onLogCommunication}>Log Communication</Button>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function CommunicationList({
  customerId,
  customerName,
  initialCommunications = [],
}: CommunicationListProps) {
  // State
  const [communications, setCommunications] = React.useState<CommunicationWithLogger[]>(
    initialCommunications
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFiltering, setIsFiltering] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(false);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [total, setTotal] = React.useState<number | undefined>();

  // Filters
  const [filters, setFilters] = React.useState<Filters>({
    type: 'all',
    direction: 'all',
    search: '',
  });

  // Modals
  const [showLogModal, setShowLogModal] = React.useState(false);
  const [editingCommunication, setEditingCommunication] =
    React.useState<CommunicationWithLogger | null>(null);
  const [deletingCommunication, setDeletingCommunication] =
    React.useState<CommunicationWithLogger | null>(null);

  // Debounced search
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  // ==========================================================================
  // Data Fetching
  // ==========================================================================

  const fetchCommunications = React.useCallback(
    async (cursor?: string | null, append = false) => {
      setIsLoading(!append);
      if (!append) setIsFiltering(true);

      try {
        const result = await listCommunications({
          customerId,
          limit: 25,
          cursor: cursor ?? undefined,
          type: filters.type === 'all' ? undefined : filters.type,
          direction: filters.direction === 'all' ? undefined : filters.direction,
          search: filters.search || undefined,
        });

        if (!result.success) {
          toast.error(result.error || 'Failed to load communications');
          return;
        }

        const { items, hasMore: more, nextCursor: next, total: count } = result.data;

        if (append) {
          setCommunications((prev) => [...prev, ...items]);
        } else {
          setCommunications(items);
        }
        setHasMore(more);
        setNextCursor(next);
        setTotal(count);
      } catch (error) {
        console.error('Failed to fetch communications:', error);
        toast.error('Failed to load communications');
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    },
    [customerId, filters]
  );

  // Initial load and filter changes
  React.useEffect(() => {
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchCommunications();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchCommunications]);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleLoadMore = () => {
    if (hasMore && nextCursor) {
      fetchCommunications(nextCursor, true);
    }
  };

  const handleClearFilters = () => {
    setFilters({ type: 'all', direction: 'all', search: '' });
  };

  const handleEdit = (communication: CommunicationWithLogger) => {
    setEditingCommunication(communication);
  };

  const handleDelete = (communication: CommunicationWithLogger) => {
    setDeletingCommunication(communication);
  };

  const confirmDelete = async () => {
    if (!deletingCommunication) return;

    try {
      const result = await deleteCommunication(deletingCommunication.id, customerId);

      if (!result.success) {
        toast.error(result.error || 'Failed to delete communication');
        return;
      }

      toast.success('Communication deleted');
      setCommunications((prev) =>
        prev.filter((c) => c.id !== deletingCommunication.id)
      );
    } catch (error) {
      console.error('Failed to delete communication:', error);
      toast.error('Failed to delete communication');
    } finally {
      setDeletingCommunication(null);
    }
  };

  const handleSuccess = () => {
    fetchCommunications();
  };

  // ==========================================================================
  // Render
  // ==========================================================================

  const hasFilters =
    filters.type !== 'all' || filters.direction !== 'all' || filters.search !== '';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900">
            Communications
            {total !== undefined && (
              <span className="ml-2 text-zinc-500">({total})</span>
            )}
          </h3>
        </div>
        <Button onClick={() => setShowLogModal(true)} size="sm">
          <Phone className="w-4 h-4 mr-2" />
          Log Communication
        </Button>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onClear={handleClearFilters}
        isFiltering={isFiltering}
      />

      {/* Content */}
      {isLoading && !isFiltering ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      ) : communications.length === 0 ? (
        <EmptyState
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
          onLogCommunication={() => setShowLogModal(true)}
        />
      ) : (
        <>
          {/* Communication Items */}
          <div className="space-y-3">
            {communications.map((communication) => (
              <CommunicationItem
                key={communication.id}
                communication={communication}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button variant="secondary" onClick={handleLoadMore} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Log Communication Modal */}
      <LogCommunicationModal
        customerId={customerId}
        customerName={customerName}
        open={showLogModal}
        onOpenChange={setShowLogModal}
        onSuccess={handleSuccess}
      />

      {/* Edit Communication Modal */}
      {editingCommunication && (
        <EditCommunicationModal
          communication={editingCommunication}
          open={!!editingCommunication}
          onOpenChange={(open) => !open && setEditingCommunication(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCommunication}
        onOpenChange={(open) => !open && setDeletingCommunication(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Communication</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deletingCommunication?.type}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
