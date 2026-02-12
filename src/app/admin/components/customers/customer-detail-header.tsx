'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { formatPhone } from '@/lib/utils/phone';
import { cn } from '@/lib/utils';
import type { CustomerWithDetails } from '@/lib/types/customer';
import { LogCommunicationModal } from '../communications/log-communication-modal';
import { CommunicationType } from '@/lib/database.types';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteCustomer } from '@/app/actions/customers';

/**
 * Customer Detail Header Component
 *
 * Displays:
 * - Breadcrumb navigation back to customers list
 * - Customer avatar with initials
 * - Contact information (phone, email)
 * - Tags
 * - Quick action buttons (Log Call, New Estimate, Schedule Event)
 * - More actions dropdown (Edit, Delete)
 */

interface CustomerDetailHeaderProps {
  customer: CustomerWithDetails;
}

export function CustomerDetailHeader({ customer }: CustomerDetailHeaderProps) {
  const router = useRouter();

  // Communication modal state
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [commModalType, setCommModalType] = useState<CommunicationType>('call');

  // Generate initials from customer name
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Format phone for display
  const displayPhone = formatPhone(customer.phone);


  // Open communication modal with specific type
  const handleLogCommunication = (type: CommunicationType) => {
    setCommModalType(type);
    setCommModalOpen(true);
  };

  // Copy phone to clipboard
  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(customer.phone);
      toast.success('Phone number copied');
    } catch {
      toast.error('Failed to copy phone number');
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = async () => {
    if (!customer.email) return;
    try {
      await navigator.clipboard.writeText(customer.email);
      toast.success('Email copied');
    } catch {
      toast.error('Failed to copy email');
    }
  };
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link
          href="/admin/customers"
          className="text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Customers
        </Link>
        <ChevronRight className="w-4 h-4 text-zinc-400" aria-hidden="true" />
        <span className="text-zinc-900 font-medium">{customer.name}</span>
      </nav>

      {/* Header with Contact Info and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Avatar and Contact Info */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0"
            aria-hidden="true"
          >
            <span className="text-xl font-semibold text-zinc-600">
              {initials}
            </span>
          </div>

          {/* Contact Details */}
          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl font-semibold text-zinc-900 truncate">
              {customer.name}
            </h1>

            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-zinc-400" aria-hidden="true" />
              <a
                href={`tel:${customer.phone}`}
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                {displayPhone}
              </a>
              <button
                onClick={handleCopyPhone}
                className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label="Copy phone number"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Email (if present) */}
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                <a
                  href={`mailto:${customer.email}`}
                  className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors truncate"
                >
                  {customer.email}
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
                  aria-label="Copy email address"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Source (if present) */}
            {customer.source && (
              <div className="flex items-center gap-2">
                <ExternalLink
                  className="w-4 h-4 text-zinc-400"
                  aria-hidden="true"
                />
                <span className="text-sm text-zinc-500">
                  Source: {customer.source}
                </span>
              </div>
            )}

            {/* Tags */}
            {customer.tags && customer.tags.length > 0 && (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {customer.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                      borderColor: `${tag.color}30`,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Edit Button */}
          <Button variant="secondary" asChild>
            <Link href={`/admin/customers/${customer.id}/edit`}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
              className="cursor-pointer"
                onClick={() => router.push(`/admin/customers/${customer.id}/edit`)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={() => {
                  deleteCustomer(customer.id);
                  router.push('/admin/customers')
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Action Buttons */}
         <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleLogCommunication('call')}
        >
          <Phone className="w-4 h-4 mr-2" />
          Log Call
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleLogCommunication('text')}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Log Text
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleLogCommunication('email')}
        >
          <Mail className="w-4 h-4 mr-2" />
          Log Email
        </Button>

        <div className="w-px h-6 bg-zinc-200 mx-1" />

        <Button variant="secondary" size="sm" asChild>
          <Link href={`/admin/estimates/new?customerId=${customer.id}`}>
            <FileText className="w-4 h-4 mr-2" />
            New Estimate
          </Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/admin/calendar/new?customerId=${customer.id}`}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Event
          </Link>
        </Button>
      </div>

          <LogCommunicationModal
        customerId={customer.id}
        customerName={customer.name}
        open={commModalOpen}
        onOpenChange={setCommModalOpen}
        defaultType={commModalType}
      />
    </div>
  );
}
