'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Search, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchCustomers } from '@/app/actions/admin/customers';

interface CustomerResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

export default function ClientCustomerSelector() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<CustomerResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Your exact useEffect + debounced search logic
  React.useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await searchCustomers(query);
        if (result.success && result.data) {
          setResults(result.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        setResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectCustomer = (customerId: string) => {
    router.push(`/admin/estimates/new?customerId=${customerId}`);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          type="text"
          placeholder="Search by name or phone number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          autoFocus
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
        )}
      </div>

      {/* Results – your exact rendering logic */}
      <div className="mt-4">
        {results.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {results.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer.id)}
                className="w-full text-left px-4 py-3 hover:bg-zinc-50 transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 group-hover:text-blue-600">
                    {customer.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {customer.phone}
                    {customer.email && ` • ${customer.email}`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        ) : hasSearched && query.length >= 2 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">No customers found</p>
            <p className="text-xs text-zinc-400 mt-1">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm text-zinc-500">
              Type at least 2 characters to search
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
