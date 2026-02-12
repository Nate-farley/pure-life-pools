import { Metadata } from 'next';
import Link from 'next/link';
import { Users, Calendar, FileText, ArrowRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Pool Service CRM Dashboard',
};

/**
 * Dashboard Home Page
 *
 * Overview page with quick stats and actions.
 * For now, displays navigation cards to main sections.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Welcome to your Pool Service CRM
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          href="/admin/customers"
          icon={Users}
          title="Customers"
          description="Manage customer database"
          action="View Customers"
        />
        <QuickActionCard
          href="/admin/calendar"
          icon={Calendar}
          title="Calendar"
          description="Schedule appointments"
          action="View Calendar"
        />
        <QuickActionCard
          href="/admin/estimates"
          icon={FileText}
          title="Estimates"
          description="Create and track quotes"
          action="View Estimates"
        />
      </div>

      {/* Recent Activity - placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            No recent activity to display. Start by adding your first customer!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface QuickActionCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
}

function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  action,
}: QuickActionCardProps) {
  return (
    <Card className="hover:border-zinc-300 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-zinc-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
            <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
            <Button variant="link" asChild className="px-0 h-auto mt-2">
              <Link href={href} className="text-sm">
                {action}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const dynamic = 'force-dynamic';
