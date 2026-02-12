'use client';

/**
 * Log Communication Modal
 *
 * @file src/components/communications/log-communication-modal.tsx
 *
 * Modal dialog for logging a new communication (call, text, email).
 * Includes type selector, direction toggle, datetime picker, and summary input.
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, MessageSquare, Mail, ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createCommunication } from '@/app/actions/communications';
import { toast } from 'sonner';
import {
  COMMUNICATION_TYPES,
  COMMUNICATION_DIRECTIONS,
  type CommunicationType,
  type CommunicationDirection,
} from '@/lib/validations/communication';

// =============================================================================
// Types
// =============================================================================

interface LogCommunicationModalProps {
  customerId: string;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  /**
   * Pre-select communication type when opening modal
   */
  defaultType?: CommunicationType;
}

// =============================================================================
// Form Schema
// =============================================================================

const formSchema = z.object({
  type: z.enum(COMMUNICATION_TYPES),
  direction: z.enum(COMMUNICATION_DIRECTIONS),
  summary: z.string().min(1, 'Please enter a summary').max(5000),
  occurredAt: z.string().min(1, 'Please select when this occurred'),
});

type FormData = z.infer<typeof formSchema>;

// =============================================================================
// Type Selector Component
// =============================================================================

interface TypeSelectorProps {
  value: CommunicationType;
  onChange: (value: CommunicationType) => void;
}

function TypeSelector({ value, onChange }: TypeSelectorProps) {
  const types: { value: CommunicationType; label: string; icon: React.ReactNode }[] = [
    { value: 'call', label: 'Call', icon: <Phone className="w-4 h-4" /> },
    { value: 'text', label: 'Text', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-2">
      {types.map((type) => (
        <button
          key={type.value}
          type="button"
          onClick={() => onChange(type.value)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-colors',
            value === type.value
              ? 'bg-zinc-900 text-white border-zinc-900'
              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50 hover:border-zinc-400'
          )}
        >
          {type.icon}
          {type.label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Direction Toggle Component
// =============================================================================

interface DirectionToggleProps {
  value: CommunicationDirection;
  onChange: (value: CommunicationDirection) => void;
}

function DirectionToggle({ value, onChange }: DirectionToggleProps) {
  const directions: { value: CommunicationDirection; label: string; icon: React.ReactNode }[] = [
    { value: 'inbound', label: 'Inbound', icon: <ArrowDownLeft className="w-4 h-4" /> },
    { value: 'outbound', label: 'Outbound', icon: <ArrowUpRight className="w-4 h-4" /> },
  ];

  return (
    <div className="flex gap-2">
      {directions.map((dir) => (
        <button
          key={dir.value}
          type="button"
          onClick={() => onChange(dir.value)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-colors',
            value === dir.value
              ? 'bg-zinc-100 text-zinc-900 border-zinc-300'
              : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-700'
          )}
        >
          {dir.icon}
          {dir.label}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function LogCommunicationModal({
  customerId,
  customerName,
  open,
  onOpenChange,
  onSuccess,
  defaultType = 'call',
}: LogCommunicationModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Get current datetime in local timezone for default value
  const getLocalDateTimeString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultType,
      direction: 'outbound',
      summary: '',
      occurredAt: getLocalDateTimeString(),
    },
  });

  // Reset form when modal opens with new defaults
  React.useEffect(() => {
    if (open) {
      form.reset({
        type: defaultType,
        direction: 'outbound',
        summary: '',
        occurredAt: getLocalDateTimeString(),
      });
    }
  }, [open, defaultType, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Convert local datetime to ISO string
      const occurredAt = new Date(data.occurredAt).toISOString();

      const result = await createCommunication({
        customerId,
        type: data.type,
        direction: data.direction,
        summary: data.summary,
        occurredAt,
      });

      if (!result.success) {
        toast.error(result.error || 'Failed to log communication');
        return;
      }

      toast.success(`${data.type.charAt(0).toUpperCase() + data.type.slice(1)} logged successfully`);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to log communication:', error);
      toast.error('Failed to log communication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchType = form.watch('type');
  const watchDirection = form.watch('direction');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Log Communication</DialogTitle>
          <DialogDescription>
            Record an interaction with {customerName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Communication Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <TypeSelector
              value={watchType}
              onChange={(value) => form.setValue('type', value)}
            />
          </div>

          {/* Direction */}
          <div className="space-y-2">
            <Label>Direction</Label>
            <DirectionToggle
              value={watchDirection}
              onChange={(value) => form.setValue('direction', value)}
            />
          </div>

          {/* Date/Time */}
          <div className="space-y-2">
            <Label htmlFor="occurredAt">When</Label>
            <Input
              id="occurredAt"
              type="datetime-local"
              {...form.register('occurredAt')}
              className={cn(form.formState.errors.occurredAt && 'border-red-500')}
            />
            {form.formState.errors.occurredAt && (
              <p className="text-sm text-red-600">
                {form.formState.errors.occurredAt.message}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder={`What was discussed during this ${watchType}?`}
              rows={4}
              {...form.register('summary')}
              className={cn(
                'resize-none',
                form.formState.errors.summary && 'border-red-500'
              )}
            />
            {form.formState.errors.summary && (
              <p className="text-sm text-red-600">
                {form.formState.errors.summary.message}
              </p>
            )}
            <p className="text-xs text-zinc-500">
              {form.watch('summary')?.length || 0} / 5000 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Log Communication'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
