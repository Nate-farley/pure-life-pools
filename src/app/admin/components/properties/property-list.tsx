'use client';

import * as React from 'react';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { PropertyCard, PropertyCardSkeleton } from './property-card';
import { PropertyForm } from './property-form';
import { PoolModal, PoolDeleteDialog, usePoolModal } from '@/components/pools/pool-modal';
import { createProperty, updateProperty, deleteProperty } from '@/app/actions/properties';
import type { Property, Pool } from '@/lib/types/database';

/**
 * Property List Component
 *
 * Displays all properties for a customer with:
 * - Grid of property cards
 * - Add property button and modal
 * - Edit property modal
 * - Delete confirmation dialog
 * - Pool add/edit/delete modals
 */

interface PropertyWithPool extends Property {
  pool: Pool | null;
}

interface PropertyListProps {
  customerId: string;
  initialProperties: PropertyWithPool[];
}

export function PropertyList({
  customerId,
  initialProperties,
}: PropertyListProps) {
  const [properties, setProperties] = React.useState<PropertyWithPool[]>(initialProperties);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingProperty, setEditingProperty] = React.useState<PropertyWithPool | null>(null);
  const [deletingProperty, setDeletingProperty] = React.useState<PropertyWithPool | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Pool modal state
  const poolModal = usePoolModal(customerId);

  // Handle successful property creation
  const handlePropertyCreated = (property: Property) => {
    setProperties((prev) => [{ ...property, pool: null }, ...prev]);
    setIsAddDialogOpen(false);
    setError(null);
  };

  // Handle successful property update
  const handlePropertyUpdated = (property: Property) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === property.id ? { ...property, pool: p.pool } : p
      )
    );
    setEditingProperty(null);
    setError(null);
  };

  // Handle property deletion
  const handleDeleteProperty = async () => {
    if (!deletingProperty) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteProperty(deletingProperty.id, customerId);

      if (result.success) {
        setProperties((prev) => prev.filter((p) => p.id !== deletingProperty.id));
        setDeletingProperty(null);
      } else {
        setError(result.error ?? 'Failed to delete property');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle successful pool creation/update
  const handlePoolSuccess = (pool: Pool, propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId ? { ...p, pool } : p
      )
    );
  };

  // Handle pool deletion
  const handlePoolDelete = async () => {
    const result = await poolModal.handleDelete();
    if (result?.success && result.propertyId) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === result.propertyId ? { ...p, pool: null } : p
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {(error || poolModal.error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || poolModal.error}</AlertDescription>
        </Alert>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {properties.length === 0
            ? 'No properties added yet'
            : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`}
        </p>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      {properties.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={setEditingProperty}
              onDelete={setDeletingProperty}
              onAddPool={poolModal.openAddPool}
              onEditPool={poolModal.openEditPool}
              onDeletePool={poolModal.openDeletePool}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAdd={() => setIsAddDialogOpen(true)} />
      )}

      {/* Add Property Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Property</DialogTitle>
          </DialogHeader>
          <PropertyForm
            customerId={customerId}
            onSuccess={handlePropertyCreated}
            onCancel={() => setIsAddDialogOpen(false)}
            createAction={createProperty}
            updateAction={updateProperty}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog
        open={!!editingProperty}
        onOpenChange={(open) => !open && setEditingProperty(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
          </DialogHeader>
          {editingProperty && (
            <PropertyForm
              customerId={customerId}
              property={editingProperty}
              onSuccess={handlePropertyUpdated}
              onCancel={() => setEditingProperty(null)}
              createAction={createProperty}
              updateAction={updateProperty}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Property Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProperty}
        onOpenChange={(open) => !open && setDeletingProperty(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property?
              {deletingProperty?.pool && (
                <span className="block mt-2 font-medium text-amber-600">
                  This will also delete the associated pool information.
                </span>
              )}
              <span className="block mt-2">
                {deletingProperty?.address_line1}, {deletingProperty?.city},{' '}
                {deletingProperty?.state} {deletingProperty?.zip_code}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProperty}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete Property'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pool Add/Edit Modal */}
      <PoolModal
        property={poolModal.modalProperty}
        customerId={customerId}
        mode={poolModal.modalMode}
        onClose={poolModal.closeModal}
        onSuccess={handlePoolSuccess}
      />

      {/* Pool Delete Confirmation Dialog */}
      <PoolDeleteDialog
        pool={poolModal.deletingPool?.pool ?? null}
        property={poolModal.deletingPool?.property ?? null}
        customerId={customerId}
        isDeleting={poolModal.isDeleting}
        onClose={poolModal.closeDeleteDialog}
        onConfirm={handlePoolDelete}
      />
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-zinc-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <Building2 className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-900 mb-1">
        No properties yet
      </h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm">
        Add a property to track pool service locations for this customer.
      </p>
      <Button onClick={onAdd}>
        <Plus className="w-4 h-4 mr-2" />
        Add Property
      </Button>
    </div>
  );
}

/**
 * Property List Skeleton
 *
 * Loading state for the property list.
 */
export function PropertyListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
        <div className="h-8 w-28 bg-zinc-200 rounded animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PropertyCardSkeleton />
        <PropertyCardSkeleton />
      </div>
    </div>
  );
}
