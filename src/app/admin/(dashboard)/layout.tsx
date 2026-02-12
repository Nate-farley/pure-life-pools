import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AuthProvider } from '@/components/providers';
import { getCurrentUser } from '@/app/actions/auth';

/**
 * Dashboard Layout
 *
 * Protected layout for all authenticated routes.
 * Includes sidebar navigation and header with global search.
 */

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current user (server-side)
  const user = await getCurrentUser();

  // This shouldn't happen due to middleware, but just in case
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <AuthProvider initialUser={user}>
      <div className="min-h-screen bg-zinc-50">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="pl-60">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
