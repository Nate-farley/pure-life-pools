'use client';

import * as React from 'react';
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
import { PoolForm } from './pool-form';
import { createPool, updatePool, deletePool } from '@/app/actions/pools';
import { getPoolTypeLabel, getSurfaceTypeLabel } from '@/lib/validations/pool';
import type { Pool, Property } from '@/lib/types/database';

/**
 * Pool Modal Component
 *
 * Handles the modal dialogs for adding, editing, and deleting pools.
 * This is a controller component that manages the modal state and actions.
 */

interface PropertyWithPool extends Property {
  pool: Pool | null;
}

interface PoolModalProps {
  /** The property to add/edit pool for */
  property: PropertyWithPool | null;
  /** Customer ID for revalidation */
  customerId: string;
  /** Current mode: 'add', 'edit', or null (closed) */
  mode: 'add' | 'edit' | null;
  /** Called when modal should close */
  onClose: () => void;
  /** Called when pool is created or updated */
  onSuccess: (pool: Pool, propertyId: string) => void;
}

export function PoolModal({
  property,
  customerId,
  mode,
  onClose,
  onSuccess,
}: PoolModalProps) {
  const handleSuccess = (pool: Pool) => {
    if (property) {
      onSuccess(pool, property.id);
    }
    onClose();
  };

  const isOpen = mode !== null && property !== null;
  const isEditMode = mode === 'edit' && property?.pool !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Pool' : 'Add Pool'}
          </DialogTitle>
        </DialogHeader>
        {property && (
          <div className="mb-4 p-3 bg-zinc-50 rounded-md">
            <p className="text-sm text-zinc-600">
              {property.address_line1}, {property.city}, {property.state}
            </p>
          </div>
        )}
        {property && (
          <PoolForm
            propertyId={property.id}
            customerId={customerId}
            pool={isEditMode ? property.pool! : undefined}
            onSuccess={handleSuccess}
            onCancel={onClose}
            createAction={createPool}
            updateAction={updatePool}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Pool Delete Confirmation Dialog
 */
interface PoolDeleteDialogProps {
  /** Pool to delete */
  pool: Pool | null;
  /** Property the pool belongs to */
  property: PropertyWithPool | null;
  /** Customer ID for revalidation */
  customerId: string;
  /** Whether delete is in progress */
  isDeleting: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** Called to perform deletion */
  onConfirm: () => void;
}

export function PoolDeleteDialog({
  pool,
  property,
  customerId,
  isDeleting,
  onClose,
  onConfirm,
}: PoolDeleteDialogProps) {
  return (
    <AlertDialog open={!!pool} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Pool</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this pool?
            {pool && (
              <span className="block mt-2">
                <strong>{getPoolTypeLabel(pool.type)}</strong> pool
                {pool.surface_type && (
                  <> with {getSurfaceTypeLabel(pool.surface_type)} surface</>
                )}
              </span>
            )}
            {property && (
              <span className="block mt-1 text-zinc-500">
                at {property.address_line1}
              </span>
            )}
            <span className="block mt-2 text-amber-600 font-medium">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deleting...' : 'Delete Pool'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook for managing pool modal state
 *
 * Provides a simple API for opening/closing pool modals and handling actions.
 */
export function usePoolModal(customerId: string) {
  const [modalProperty, setModalProperty] = React.useState<PropertyWithPool | null>(null);
  const [modalMode, setModalMode] = React.useState<'add' | 'edit' | null>(null);
  const [deletingPool, setDeletingPool] = React.useState<{
    pool: Pool;
    property: PropertyWithPool;
  } | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const openAddPool = React.useCallback((property: PropertyWithPool) => {
    setModalProperty(property);
    setModalMode('add');
    setError(null);
  }, []);

  const openEditPool = React.useCallback((property: PropertyWithPool) => {
    if (property.pool) {
      setModalProperty(property);
      setModalMode('edit');
      setError(null);
    }
  }, []);

  const openDeletePool = React.useCallback((property: PropertyWithPool) => {
    if (property.pool) {
      setDeletingPool({ pool: property.pool, property });
      setError(null);
    }
  }, []);

  const closeModal = React.useCallback(() => {
    setModalProperty(null);
    setModalMode(null);
  }, []);

  const closeDeleteDialog = React.useCallback(() => {
    setDeletingPool(null);
  }, []);

  const handleDelete = React.useCallback(async () => {
    if (!deletingPool) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deletePool(
        deletingPool.pool.id,
        deletingPool.property.id,
        customerId
      );

      if (result.success) {
        setDeletingPool(null);
        return { success: true, propertyId: deletingPool.property.id };
      } else {
        setError(result.error ?? 'Failed to delete pool');
        return { success: false };
      }
    } catch (err) {
      setError('An unexpected error occurred');
      return { success: false };
    } finally {
      setIsDeleting(false);
    }
  }, [deletingPool, customerId]);

  return {
    modalProperty,
    modalMode,
    deletingPool,
    isDeleting,
    error,
    openAddPool,
    openEditPool,
    openDeletePool,
    closeModal,
    closeDeleteDialog,
    handleDelete,
  };
}
