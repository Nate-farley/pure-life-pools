import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import './styles/fullcalendar.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico"
  },
  title: {
    default: 'Pure Life Pools Customer Management Platform',
    template: '%s | Pure Life CRM',
  },
  description: 'Pool Service Customer Relationship Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-zinc-50 antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'border border-zinc-200',
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
