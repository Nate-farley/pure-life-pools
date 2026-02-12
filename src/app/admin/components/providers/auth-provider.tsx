'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { AuthUser } from '@/app/actions/auth';

/**
 * Auth Context
 *
 * Provides authentication state to client components.
 * Handles session monitoring and automatic sign-out on session expiry.
 */

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: AuthUser | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = React.useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = React.useState(false);

  // Listen for auth state changes
  React.useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/admin/login');
        router.refresh();
      } else if (event === 'SIGNED_IN' && session) {
        // Fetch admin details when signed in
        const { data: admin } = await supabase
          .from('admins')
          .select('id, email, full_name')
          .eq('id', session.user.id)
          .single();

        if (admin) {
          setUser({
            id: admin.id,
            email: admin.email,
            fullName: admin.full_name,
          });
        }
        router.refresh();
      } else if (event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      router.push('/admin/login');
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      signOut,
    }),
    [user, isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
