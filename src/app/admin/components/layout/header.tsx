'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Command, User, Loader2 } from 'lucide-react';
import { globalSearchCustomers } from '@/app/actions/customers';
import { formatPhone } from '@/lib/utils/phone';
import { cn } from '@/lib/utils';

/**
 * Header Component
 *
 * Sticky header with global search bar.
 * Height: 56px (h-14)
 */

interface SearchResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export function Header() {
  const router = useRouter();
  const [searchValue, setSearchValue] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search when value changes
  React.useEffect(() => {
    if (searchValue.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const result = await globalSearchCustomers(searchValue, 8);
      if (result.success) {
        setResults(result.data);
      }
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToCustomer(results[selectedIndex].id);
        }
        break;
    }
  };

  const navigateToCustomer = (id: string) => {
    setIsOpen(false);
    setSearchValue('');
    setResults([]);
    setSelectedIndex(-1);
    router.push(`/admin/customers/${id}`);
  };

  const showDropdown = isOpen && (searchValue.length >= 2 || isLoading);

  return (
    <header className="sticky top-0 z-20 h-14 px-6 bg-white border-b border-zinc-200 flex items-center justify-between">
      {/* Global Search */}
      <div className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search customers..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={cn(
              'w-full h-9 pl-10 pr-12',
              'bg-white',
              'text-zinc-900 text-sm placeholder:text-zinc-500',
              'border border-zinc-300 hover:border-zinc-400',
              'rounded-md',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-0 focus:border-zinc-950',
              '[&::-webkit-search-cancel-button]:hidden'
            )}
          />
          {/* Keyboard shortcut hint */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
            ) : (
              <kbd
                className={cn(
                  'hidden sm:inline-flex items-center gap-1',
                  'px-1.5 py-0.5',
                  'text-[10px] font-medium text-zinc-400',
                  'bg-zinc-100 border border-zinc-200 rounded'
                )}
              >
                <Command className="w-3 h-3" />K
              </kbd>
            )}
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className={cn(
              'absolute top-full left-0 right-0 mt-1',
              'bg-white border border-zinc-200 rounded-lg shadow-lg',
              'max-h-80 overflow-y-auto',
              'z-50'
            )}
          >
            {isLoading && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-zinc-500">
                Searching...
              </div>
            )}

            {!isLoading && searchValue.length >= 2 && results.length === 0 && (
              <div className="px-4 py-3 text-sm text-zinc-500">
                No customers found for "{searchValue}"
              </div>
            )}

            {results.length > 0 && (
              <ul className="py-1">
                {results.map((result, index) => (
                  <li key={result.id}>
                    <button
                      onClick={() => navigateToCustomer(result.id)}
                      className={cn(
                        'w-full px-4 py-2 text-left',
                        'flex items-center gap-3',
                        'transition-colors duration-100',
                        index === selectedIndex
                          ? 'bg-zinc-100'
                          : 'hover:bg-zinc-50'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-zinc-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {result.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {formatPhone(result.phone)}
                          {result.email && ` • ${result.email}`}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* View all link */}
            {results.length > 0 && (
              <div className="border-t border-zinc-200 px-4 py-2">
                <Link
                  href={`/admin/customers?search=${encodeURIComponent(searchValue)}`}
                  onClick={() => {
                    setIsOpen(false);
                    setSearchValue('');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  View all results →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side - can add notifications, etc. */}
      <div className="flex items-center gap-4">
        {/* Placeholder for future items */}
      </div>
    </header>
  );
}
