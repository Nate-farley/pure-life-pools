'use client';

import * as React from 'react';
import {
  Droplets,
  Ruler,
  Layers,
  Wrench,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  getPoolTypeLabel,
  getSurfaceTypeLabel,
  formatPoolDimensions,
  formatPoolVolume,
} from '@/lib/validations/pool';
import type { Pool } from '@/lib/types/database';

/**
 * Pool Details Component
 *
 * Displays pool information in a compact card format.
 * Used within property cards on the customer detail page.
 */

interface PoolDetailsProps {
  pool: Pool;
  onEdit: (pool: Pool) => void;
  onDelete: (pool: Pool) => void;
  /** If true, shows as a standalone card. If false, shows inline. */
  variant?: 'card' | 'inline';
}

export function PoolDetails({
  pool,
  onEdit,
  onDelete,
  variant = 'inline',
}: PoolDetailsProps) {
  const dimensions = formatPoolDimensions({
    length_ft: pool.length_ft,
    width_ft: pool.width_ft,
    depth_shallow_ft: pool.depth_shallow_ft,
    depth_deep_ft: pool.depth_deep_ft,
  });

  const volume = formatPoolVolume(pool.volume_gallons);

  if (variant === 'inline') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-zinc-900">
              {getPoolTypeLabel(pool.type)} Pool
            </span>
            {pool.surface_type && (
              <Badge variant="secondary" className="text-xs">
                {getSurfaceTypeLabel(pool.surface_type)}
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Pool actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEdit(pool)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Pool
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => onDelete(pool)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Pool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Pool details */}
        <div className="pl-6 space-y-1">
          {dimensions && (
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Ruler className="w-3 h-3 text-zinc-400" />
              <span>{dimensions}</span>
            </div>
          )}
          {volume && (
            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <Droplets className="w-3 h-3 text-zinc-400" />
              <span>{volume}</span>
            </div>
          )}
          {pool.equipment_notes && (
            <div className="flex items-start gap-2 text-xs text-zinc-600">
              <Wrench className="w-3 h-3 text-zinc-400 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{pool.equipment_notes}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-md">
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {getPoolTypeLabel(pool.type)} Pool
            </p>
            {pool.surface_type && (
              <p className="text-xs text-zinc-500">
                {getSurfaceTypeLabel(pool.surface_type)} surface
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Pool actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(pool)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Pool
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => onDelete(pool)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Pool
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dimensions Grid */}
      {(pool.length_ft || pool.width_ft || pool.depth_shallow_ft || pool.depth_deep_ft) && (
        <div className="grid grid-cols-2 gap-3">
          {pool.length_ft && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Length:</span>
              <span className="text-sm text-zinc-900">{pool.length_ft} ft</span>
            </div>
          )}
          {pool.width_ft && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Width:</span>
              <span className="text-sm text-zinc-900">{pool.width_ft} ft</span>
            </div>
          )}
          {pool.depth_shallow_ft && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Shallow:</span>
              <span className="text-sm text-zinc-900">{pool.depth_shallow_ft} ft</span>
            </div>
          )}
          {pool.depth_deep_ft && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Deep:</span>
              <span className="text-sm text-zinc-900">{pool.depth_deep_ft} ft</span>
            </div>
          )}
        </div>
      )}

      {/* Volume */}
      {pool.volume_gallons && (
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
          <Droplets className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-zinc-900">
            {pool.volume_gallons.toLocaleString()} gallons
          </span>
        </div>
      )}

      {/* Equipment Notes */}
      {pool.equipment_notes && (
        <div className="pt-2 border-t border-zinc-100">
          <div className="flex items-start gap-2">
            <Wrench className="w-4 h-4 text-zinc-400 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-zinc-700 mb-1">Equipment</p>
              <p className="text-sm text-zinc-600">{pool.equipment_notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Pool Details Skeleton
 *
 * Loading state for pool details.
 */
export function PoolDetailsSkeleton({ variant = 'inline' }: { variant?: 'card' | 'inline' }) {
  if (variant === 'inline') {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-zinc-200 rounded" />
          <div className="h-4 w-24 bg-zinc-200 rounded" />
          <div className="h-5 w-16 bg-zinc-200 rounded-full" />
        </div>
        <div className="pl-6 space-y-1">
          <div className="h-3 w-32 bg-zinc-200 rounded" />
          <div className="h-3 w-24 bg-zinc-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-4 space-y-4 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-zinc-200 rounded-md" />
        <div className="space-y-1">
          <div className="h-4 w-24 bg-zinc-200 rounded" />
          <div className="h-3 w-16 bg-zinc-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-4 w-20 bg-zinc-200 rounded" />
        <div className="h-4 w-20 bg-zinc-200 rounded" />
      </div>
    </div>
  );
}
