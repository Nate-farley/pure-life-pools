import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input Component
 *
 * Text input following the design system specification.
 */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-2',
          'text-sm text-zinc-900 placeholder:text-zinc-500',
          'hover:border-zinc-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-0 focus-visible:border-zinc-950',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-100 disabled:text-zinc-500',
          'transition-colors duration-150',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
