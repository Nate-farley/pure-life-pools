'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Search Input Component
 *
 * Debounced search input with clear button.
 * Follows design system specifications.
 */

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  autoFocus = false,
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync local value when external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleClear = React.useCallback(() => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
      <input
        ref={inputRef}
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full h-9 pl-10 pr-10',
          'bg-white',
          'text-zinc-900 text-sm placeholder:text-zinc-500',
          'border border-zinc-300 hover:border-zinc-400',
          'rounded-md',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-0 focus:border-zinc-950',
          // Hide browser's default clear button
          '[&::-webkit-search-cancel-button]:hidden'
        )}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
