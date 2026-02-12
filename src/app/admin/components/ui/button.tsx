import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button Component
 *
 * Follows the design system specification exactly.
 * Uses Radix Slot for component composition via asChild prop.
 */

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center
   text-sm font-medium
   rounded-md
   transition-colors duration-150
   focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2
   disabled:opacity-50 disabled:pointer-events-none`,
  {
    variants: {
      variant: {
        // Primary button (zinc-900 based)
        primary: `bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950
                  text-white`,
        // Secondary button (white with border)
        secondary: `bg-white hover:bg-zinc-50 active:bg-zinc-100
                    text-zinc-900
                    border border-zinc-300 hover:border-zinc-400`,
        // Ghost button (transparent)
        ghost: `bg-transparent hover:bg-zinc-100 active:bg-zinc-200
                text-zinc-700 hover:text-zinc-900`,
        // Destructive button (red)
        destructive: `bg-red-600 hover:bg-red-700 active:bg-red-800
                      text-white`,
        // Link style
        link: `bg-transparent underline-offset-4 hover:underline
               text-blue-600 hover:text-blue-700`,
      },
      size: {
        // Small: 32px height
        sm: 'h-8 px-3 text-sm',
        // Default: 36px height
        default: 'h-9 px-4',
        // Large: 40px height
        lg: 'h-10 px-5',
        // Icon only (square)
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, the button will render its children as a Radix Slot,
   * allowing for component composition.
   */
  asChild?: boolean;
  /**
   * Shows a loading spinner and disables the button.
   */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
