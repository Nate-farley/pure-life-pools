import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

/**
 * Label Component
 *
 * Follows the design system specification exactly.
 * Uses Radix Label primitive for accessibility.
 */

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    /**
     * Makes the label appear optional.
     */
    optional?: boolean;
    /**
     * Marks the field as required.
     */
    required?: boolean;
  }
>(({ className, children, optional, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'block text-sm font-medium text-zinc-900 mb-1.5',
      className
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="text-red-500 ml-0.5" aria-hidden="true">
        *
      </span>
    )}
    {optional && (
      <span className="text-zinc-500 text-xs font-normal ml-1">
        (optional)
      </span>
    )}
  </LabelPrimitive.Root>
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
