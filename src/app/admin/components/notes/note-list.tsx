'use client';

import * as React from 'react';
import { Plus, StickyNote, AlertCircle, Loader2 } from 'lucide-react';
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
import { NoteCard, NoteCardSkeleton } from './note-card';
import { NoteForm, QuickNoteForm } from './note-form';
import { createNote, updateNote, deleteNote, listNotesByCustomer } from '@/app/actions/notes';
import { formatRelativeTime } from '@/lib/validations/note';
import type { CustomerNote, CustomerAttachment } from '@/lib/types/database';

/**
 * Note List Component
 *
 * Displays all notes for a customer with:
 * - Quick add form at the top
 * - List of note cards
 * - Edit/delete modals
 * - Pagination (load more)
 */

interface NoteWithAuthor extends CustomerNote {
  author: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  attachments?: CustomerAttachment[];
}

interface NoteListProps {
  customerId: string;
  initialNotes: NoteWithAuthor[];
}

export function NoteList({ customerId, initialNotes }: NoteListProps) {
  const [notes, setNotes] = React.useState<NoteWithAuthor[]>(initialNotes);
  const [editingNote, setEditingNote] = React.useState<NoteWithAuthor | null>(null);
  const [deletingNote, setDeletingNote] = React.useState<NoteWithAuthor | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Pagination state
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(initialNotes.length >= 25);
  const [cursor, setCursor] = React.useState<string | null>(null);

  // Initialize cursor from initial notes
  React.useEffect(() => {
    if (initialNotes.length > 0 && initialNotes.length >= 25) {
      const lastNote = initialNotes[initialNotes.length - 1];
      setCursor(
        Buffer.from(
          JSON.stringify({ createdAt: lastNote.created_at })
        ).toString('base64')
      );
    }
  }, []);

  // Handle successful note creation
  const handleNoteCreated = (note: NoteWithAuthor) => {
    setNotes((prev) => [note, ...prev]);
    setError(null);
  };

  // Handle successful note update
  const handleNoteUpdated = (note: NoteWithAuthor) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...note, attachments: n.attachments } : n))
    );
    setEditingNote(null);
    setError(null);
  };

  // Handle note deletion
  const handleDeleteNote = async () => {
    if (!deletingNote) return;

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteNote(deletingNote.id, customerId);

      if (result.success) {
        setNotes((prev) => prev.filter((n) => n.id !== deletingNote.id));
        setDeletingNote(null);
      } else {
        setError(result.error ?? 'Failed to delete note');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  // Load more notes
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await listNotesByCustomer(customerId, {
        limit: 25,
        cursor: cursor ?? undefined,
      });

      if (result.success && result.data) {
        setNotes((prev) => [...prev, ...result.data.notes]);
        setHasMore(result.data.hasMore);
        setCursor(result.data.nextCursor);
      } else {
        setError(result.error ?? 'Failed to load more notes');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Add Form */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <QuickNoteForm
          customerId={customerId}
          onSuccess={handleNoteCreated}
          createAction={createNote}
        />
      </div>

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-4">
          {/* Notes Count */}
          <p className="text-sm text-zinc-500">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>

          {/* Note Cards */}
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditingNote}
                onDelete={setDeletingNote}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Notes'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Edit Note Dialog */}
      <Dialog
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <NoteForm
              customerId={customerId}
              note={editingNote}
              onSuccess={handleNoteUpdated}
              onCancel={() => setEditingNote(null)}
              createAction={createNote}
              updateAction={updateNote}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingNote}
        onOpenChange={(open) => !open && setDeletingNote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note?
              {deletingNote && (
                <span className="block mt-2 p-3 bg-zinc-50 rounded-md text-sm text-zinc-600 line-clamp-3">
                  "{deletingNote.content.slice(0, 150)}
                  {deletingNote.content.length > 150 ? '...' : ''}"
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
              onClick={handleDeleteNote}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete Note'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-zinc-200 rounded-lg">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <StickyNote className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-sm font-medium text-zinc-900 mb-1">
        No notes yet
      </h3>
      <p className="text-sm text-zinc-500 max-w-sm">
        Add a note above to keep track of important information about this customer.
      </p>
    </div>
  );
}

/**
 * Note List Skeleton
 *
 * Loading state for the note list.
 */
export function NoteListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Quick Add Skeleton */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 animate-pulse">
        <div className="h-20 bg-zinc-200 rounded-md" />
        <div className="flex justify-end mt-3">
          <div className="h-8 w-20 bg-zinc-200 rounded" />
        </div>
      </div>

      {/* Notes List Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
        <NoteCardSkeleton />
        <NoteCardSkeleton />
        <NoteCardSkeleton />
      </div>
    </div>
  );
}
