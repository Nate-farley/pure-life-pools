'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

/**
 * Pagination Component
 *
 * Simple pagination with page info and navigation buttons.
 */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        'px-4 py-3',
        'bg-white border border-zinc-200 rounded-lg',
        className
      )}
    >
      {/* Item count */}
      <p className="text-sm text-zinc-600">
        Showing <span className="font-medium text-zinc-900">{startItem}</span> to{' '}
        <span className="font-medium text-zinc-900">{endItem}</span> of{' '}
        <span className="font-medium text-zinc-900">{totalItems}</span> results
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        {/* Page indicator */}
        <span className="text-sm text-zinc-600 px-2">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Simple Pagination (just prev/next buttons)
 */
interface SimplePaginationProps {
  hasMore: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  className?: string;
}

export function SimplePagination({
  hasMore,
  hasPrevious,
  onNext,
  onPrevious,
  isLoading = false,
  className,
}: SimplePaginationProps) {
  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      <Button
        variant="secondary"
        size="sm"
        onClick={onPrevious}
        disabled={!hasPrevious || isLoading}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onNext}
        disabled={!hasMore || isLoading}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
