'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Calendar,
  FileText,
  Settings,
  LayoutDashboard,
  LogOut,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers';
import Image from 'next/image'

/**
 * Sidebar Component
 *
 * Fixed sidebar navigation following the design system exactly.
 * Width: 240px (w-60)
 */

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function NavItem({ href, icon: Icon, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        // Base styles
        `flex items-center gap-3
         px-3 py-2
         text-sm
         rounded-md
         transition-colors duration-150`,
        // Active state
        isActive
          ? 'font-medium text-zinc-900 bg-zinc-100'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
      )}
    >
      <Icon className="w-5 h-5" />
      {children}
    </Link>
  );
}

/**
 * Get initials from full name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-zinc-200 z-30 flex flex-col">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center border-b border-zinc-200">
        <Link href="/" className="flex items-center gap-2">
          <Image width={30} height={80} alt="company logo" src="/images/logo.png" />
          <span className="text-lg font-semibold text-zinc-900">Pure Life Pools CRM</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <NavItem href="/" icon={LayoutDashboard}>
          Dashboard
        </NavItem>
        <NavItem href="/admin/customers" icon={Users}>
          Customers
        </NavItem>
        <NavItem href="/admin/calendar" icon={Calendar}>
          Calendar
        </NavItem>
        <NavItem href="/admin/estimates" icon={FileText}>
          Estimates
        </NavItem>

        {/* Divider
        <div className="my-4 border-t border-zinc-200" />

        <NavItem href="/settings" icon={Settings}>
          Settings
        </NavItem> */}
      </nav>

      {/* User Menu */}
      <div className="p-3 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
            <span className="text-sm font-medium text-zinc-600">
              {user ? getInitials(user.fullName) : '??'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">
              {user?.fullName ?? 'Loading...'}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {user?.email ?? ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          disabled={isLoading}
          className={cn(
            'w-full flex items-center gap-3',
            'px-3 py-2 mt-1',
            'text-sm text-zinc-600',
            'rounded-md',
            'transition-colors duration-150',
            'hover:bg-zinc-100 hover:text-zinc-900',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          Sign Out
        </button>
      </div>
    </aside>
  );
}
