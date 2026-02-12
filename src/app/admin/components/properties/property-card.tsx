'use client';

import * as React from 'react';
import {
  Building2,
  MapPin,
  Key,
  FileText,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  Droplets,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PoolDetails } from '@/components/pools/pool-details';
import { formatAddress } from '@/lib/validations/property';
import type { Property, Pool } from '@/lib/types/database';

/**
 * Property Card Component
 *
 * Displays a property with its address, access info, and pool details.
 * Includes actions for edit, delete, and view on map.
 */

interface PropertyWithPool extends Property {
  pool: Pool | null;
}

interface PropertyCardProps {
  property: PropertyWithPool;
  onEdit: (property: PropertyWithPool) => void;
  onDelete: (property: PropertyWithPool) => void;
  onAddPool?: (property: PropertyWithPool) => void;
  onEditPool?: (property: PropertyWithPool) => void;
  onDeletePool?: (property: PropertyWithPool) => void;
}

export function PropertyCard({
  property,
  onEdit,
  onDelete,
  onAddPool,
  onEditPool,
  onDeletePool,
}: PropertyCardProps) {
  // Generate Google Maps URL
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    formatAddress(property)
  )}`;

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-300 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-zinc-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-zinc-100 rounded-md flex-shrink-0">
              <Building2 className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {property.address_line1}
              </p>
              {property.address_line2 && (
                <p className="text-sm text-zinc-500">{property.address_line2}</p>
              )}
              <p className="text-sm text-zinc-500">
                {property.city}, {property.state} {property.zip_code}
              </p>
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                aria-label="Property actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit(property)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit Property
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </a>
              </DropdownMenuItem>
              {property.pool ? (
                <>
                  <DropdownMenuItem onClick={() => onEditPool?.(property)}>
                    <Droplets className="w-4 h-4 mr-2" />
                    Edit Pool
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => onAddPool?.(property)}>
                  <Droplets className="w-4 h-4 mr-2" />
                  Add Pool
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => onDelete(property)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Property
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Access Info */}
      {(property.gate_code || property.access_notes) && (
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 space-y-2">
          {property.gate_code && (
            <div className="flex items-center gap-2 text-sm">
              <Key className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-600">Gate Code:</span>
              <span className="font-mono text-zinc-900">{property.gate_code}</span>
            </div>
          )}
          {property.access_notes && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="w-3.5 h-3.5 text-zinc-400 mt-0.5" />
              <span className="text-zinc-600 line-clamp-2">
                {property.access_notes}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Pool Info */}
      <div className="p-4">
        {property.pool ? (
          <PoolDetails
            pool={property.pool}
            onEdit={() => onEditPool?.(property)}
            onDelete={() => onDeletePool?.(property)}
            variant="inline"
          />
        ) : (
          <button
            onClick={() => onAddPool?.(property)}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            <Droplets className="w-4 h-4" />
            <span>Add pool information</span>
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in Maps
        </a>
      </div>
    </div>
  );
}

/**
 * Property Card Skeleton
 *
 * Loading state placeholder for property cards.
 */
export function PropertyCardSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden animate-pulse">
      <div className="p-4 border-b border-zinc-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-zinc-200 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-zinc-200 rounded" />
            <div className="h-3 w-1/2 bg-zinc-200 rounded" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-zinc-200 rounded" />
          <div className="h-4 w-24 bg-zinc-200 rounded" />
        </div>
      </div>
    </div>
  );
}
