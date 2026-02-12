'use client';

import * as React from 'react';
import {
  StickyNote,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  User,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  formatRelativeTime,
  formatFullTimestamp,
} from '@/lib/validations/note';
import type { CustomerNote, CustomerAttachment } from '@/lib/types/database';

/**
 * Note Card Component
 *
 * Displays a customer note with:
 * - Note content (expandable if long)
 * - Author info
 * - Timestamp (relative with full on hover)
 * - Edit/Delete actions
 * - Attachment indicators
 */

interface NoteWithAuthor extends CustomerNote {
  author: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  attachments?: CustomerAttachment[];
}

interface NoteCardProps {
  note: NoteWithAuthor;
  onEdit: (note: NoteWithAuthor) => void;
  onDelete: (note: NoteWithAuthor) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Check if note content is long (more than 300 chars or 4 lines)
  const isLongContent = note.content.length > 300 || note.content.split('\n').length > 4;
  const shouldTruncate = isLongContent && !isExpanded;

  // Get displayed content
  const displayedContent = shouldTruncate
    ? note.content.slice(0, 300) + '...'
    : note.content;

  // Check if note was edited
  const wasEdited = note.updated_at !== note.created_at;

  // Attachment count
  const attachmentCount = note.attachments?.length ?? 0;

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-300 transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Author Avatar */}
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
            {note.author ? (
              <span className="text-xs font-medium text-zinc-600">
                {getInitials(note.author.full_name)}
              </span>
            ) : (
              <User className="w-4 h-4 text-zinc-400" />
            )}
          </div>
          
          {/* Author Name & Time */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">
              {note.author?.full_name ?? 'Unknown'}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(note.created_at)}
                    {wasEdited && (
                      <span className="text-zinc-400">(edited)</span>
                    )}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Created: {formatFullTimestamp(note.created_at)}</p>
                  {wasEdited && (
                    <p>Edited: {formatFullTimestamp(note.updated_at)}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              aria-label="Note actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(note)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => onDelete(note)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Note
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        <p className="text-sm text-zinc-700 whitespace-pre-wrap break-words">
          {displayedContent}
        </p>
        
        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Attachments indicator */}
      {attachmentCount > 0 && (
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Paperclip className="w-3.5 h-3.5" />
            <span>
              {attachmentCount} {attachmentCount === 1 ? 'attachment' : 'attachments'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get initials from a full name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Note Card Skeleton
 *
 * Loading state placeholder for note cards.
 */
export function NoteCardSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-200" />
        <div className="space-y-1.5">
          <div className="h-4 w-24 bg-zinc-200 rounded" />
          <div className="h-3 w-16 bg-zinc-200 rounded" />
        </div>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="h-4 w-full bg-zinc-200 rounded" />
        <div className="h-4 w-3/4 bg-zinc-200 rounded" />
        <div className="h-4 w-1/2 bg-zinc-200 rounded" />
      </div>
    </div>
  );
}

/**
 * Compact Note Card
 *
 * Smaller variant for list views with less detail.
 */
interface CompactNoteCardProps {
  note: NoteWithAuthor;
  onClick?: () => void;
}

export function CompactNoteCard({ note, onClick }: CompactNoteCardProps) {
  const preview = note.content.length > 100
    ? note.content.slice(0, 100) + '...'
    : note.content;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <StickyNote className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-zinc-700 line-clamp-2">{preview}</p>
          <p className="text-xs text-zinc-500 mt-1">
            {note.author?.full_name ?? 'Unknown'} • {formatRelativeTime(note.created_at)}
          </p>
        </div>
      </div>
    </button>
  );
}
