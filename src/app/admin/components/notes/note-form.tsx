'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  createNoteSchema,
  updateNoteSchema,
  type CreateNoteInput,
  type UpdateNoteInput,
} from '@/lib/validations/note';
import type { CustomerNote } from '@/lib/types/database';

/**
 * Note Form Component
 *
 * Handles both create and edit modes for customer notes.
 * Simple form with just a content textarea.
 */

interface NoteWithAuthor extends CustomerNote {
  author: {
    id: string;
    full_name: string;
    email: string;
  } | null;
}

interface NoteFormProps {
  /** Customer ID - required for creating new notes */
  customerId: string;
  /** Existing note for edit mode */
  note?: NoteWithAuthor;
  /** Called on successful save */
  onSuccess: (note: NoteWithAuthor) => void;
  /** Called when user cancels */
  onCancel: () => void;
  /** Server action for creating note */
  createAction: (input: CreateNoteInput) => Promise<{ success: boolean; data?: NoteWithAuthor; error?: string }>;
  /** Server action for updating note */
  updateAction: (id: string, customerId: string, input: UpdateNoteInput) => Promise<{ success: boolean; data?: NoteWithAuthor; error?: string }>;
}

export function NoteForm({
  customerId,
  note,
  onSuccess,
  onCancel,
  createAction,
  updateAction,
}: NoteFormProps) {
  const isEditMode = !!note;
  const [serverError, setServerError] = React.useState<string | null>(null);

  // Choose schema based on mode
  const schema = isEditMode ? updateNoteSchema : createNoteSchema;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteInput | UpdateNoteInput>({
    resolver: zodResolver(schema),
    defaultValues: isEditMode
      ? {
          content: note.content,
        }
      : {
          customerId,
          content: '',
        },
  });

  const content = watch('content');
  const charCount = content?.length ?? 0;

  const onSubmit = async (data: CreateNoteInput | UpdateNoteInput) => {
    setServerError(null);

    try {
      let result;

      if (isEditMode) {
        result = await updateAction(note.id, customerId, data as UpdateNoteInput);
      } else {
        result = await createAction(data as CreateNoteInput);
      }

      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        setServerError(result.error ?? 'An error occurred');
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Server Error */}
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Hidden customer ID for create mode */}
      {!isEditMode && (
        <input type="hidden" {...register('customerId')} value={customerId} />
      )}

      {/* Note Content */}
      <div className="space-y-1.5">
        <Label htmlFor="content">
          {isEditMode ? 'Edit Note' : 'Note'}
        </Label>
        <Textarea
          id="content"
          placeholder="Write your note here..."
          rows={6}
          maxLength={10000}
          {...register('content')}
          aria-invalid={!!errors.content}
          className="resize-y min-h-[120px]"
        />
        <div className="flex justify-between items-center">
          {errors.content ? (
            <p className="text-sm text-red-600">{errors.content.message}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-zinc-500">
            {charCount.toLocaleString()} / 10,000
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || charCount === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditMode ? 'Saving...' : 'Adding...'}
            </>
          ) : (
            <>{isEditMode ? 'Save Changes' : 'Add Note'}</>
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * Quick Note Form
 *
 * Compact inline form for adding notes quickly.
 */
interface QuickNoteFormProps {
  customerId: string;
  onSuccess: (note: NoteWithAuthor) => void;
  createAction: (input: CreateNoteInput) => Promise<{ success: boolean; data?: NoteWithAuthor; error?: string }>;
}

export function QuickNoteForm({
  customerId,
  onSuccess,
  createAction,
}: QuickNoteFormProps) {
  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createAction({
        customerId,
        content: content.trim(),
      });

      if (result.success && result.data) {
        setContent('');
        onSuccess(result.data);
      } else {
        setError(result.error ?? 'Failed to add note');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Textarea
        placeholder="Add a quick note..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={10000}
        disabled={isSubmitting}
        className="resize-none"
      />
      
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Note'
          )}
        </Button>
      </div>
    </form>
  );
}
