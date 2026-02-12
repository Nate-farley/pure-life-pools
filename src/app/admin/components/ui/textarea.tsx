import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea Component
 *
 * Multi-line text input following the design system specification.
 */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2',
          'text-sm text-zinc-900 placeholder:text-zinc-500',
          'hover:border-zinc-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-0 focus-visible:border-zinc-950',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-100',
          'transition-colors duration-150',
          'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
