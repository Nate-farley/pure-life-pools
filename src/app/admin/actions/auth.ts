'use server';

/**
 * Authentication Server Actions
 *
 * Key architecture decision:
 * - createClient() is used for all auth operations because it handles session cookies
 * - createAdminClient() is ONLY used for querying the admins table (bypasses RLS)
 * - The admin client must never be used for signInWithPassword as it won't persist the session
 */

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { isAppError, getErrorMessage, ForbiddenError, UnauthorizedError } from '@/lib/utils/errors';
import type { ActionResult } from '@/lib/types/api';
import { Database } from '@/lib/types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface Session {
  user: AuthUser;
  expiresAt: number;
}

export async function login(
  input: LoginInput
): Promise<ActionResult<AuthUser>> {
  try {
    const validationResult = loginSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0]?.message ?? 'Validation failed',
        code: 'VALIDATION_ERROR',
      };
    }

    const { email, password } = validationResult.data;

    // CRITICAL: Use createClient() for auth - it handles session cookies
    // Using createAdminClient() here would authenticate but NOT persist the session
    const supabase = await createClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error('Auth error:', authError);

      if (authError.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        };
      }

      if (authError.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email address',
          code: 'EMAIL_NOT_VERIFIED',
        };
      }

      return {
        success: false,
        error: 'Authentication failed. Please try again.',
        code: 'AUTH_ERROR',
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_ERROR',
      };
    }

    // Use admin client ONLY for querying the admins table (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: admin, error: adminError } = await adminClient
      .from('admins')
      .select('id, email, full_name')
      .eq('id', authData.user.id)
      .single();

    if (adminError || !admin) {
      // Sign out since they're not an admin - use the session-aware client
      await supabase.auth.signOut();

      return {
        success: false,
        error:
          'Access denied. You must be an administrator to use this application.',
        code: 'FORBIDDEN',
      };
    }

    revalidatePath('/admin', 'layout');

    return {
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
      },
    };
  } catch (error) {
    console.error('Login error:', error);

    if (isAppError(error)) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    return {
      success: false,
      error: getErrorMessage(error),
      code: 'INTERNAL_ERROR',
    };
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/admin', 'layout');
  redirect('/admin/login');
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Use admin client for the admins table query (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: admin, error: adminError } = await adminClient
      .from('admins')
      .select('id, email, full_name')
      .eq('id', user.id)
      .single();

    if (adminError || !admin) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      fullName: admin.full_name,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Gets the current authenticated admin user.
 * Throws if not authenticated or not an admin.
 *
 * This is the primary auth helper used by other server actions.
 *
 * @returns Object containing supabase client and admin data
 * @throws UnauthorizedError if not authenticated
 * @throws ForbiddenError if authenticated but not an admin
 */
export async function getCurrentAdmin(): Promise<{
  supabase: SupabaseClient<Database>;
  admin: { id: string; email: string; full_name: string };
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError('You must be logged in to perform this action');
  }

  // Verify user is an admin
  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('id, email, full_name')
    .eq('id', user.id)
    .single();

  if (adminError || !admin) {
    throw new ForbiddenError('You do not have permission to perform this action');
  }

  return { supabase, admin };
}

export async function getSession(): Promise<Session | null> {
  try {
    const supabase = await createClient();

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return null;
    }

    // Use admin client for the admins table query (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: admin, error: adminError } = await adminClient
      .from('admins')
      .select('id, email, full_name')
      .eq('id', session.user.id)
      .single();

    if (adminError || !admin) {
      return null;
    }

    return {
      user: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
      },
      expiresAt: session.expires_at ?? 0,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function refreshSession(): Promise<ActionResult<Session>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      return {
        success: false,
        error: 'Session expired. Please log in again.',
        code: 'SESSION_EXPIRED',
      };
    }

    // Use admin client for the admins table query (bypasses RLS)
    const adminClient = createAdminClient();
    const { data: admin, error: adminError } = await adminClient
      .from('admins')
      .select('id, email, full_name')
      .eq('id', data.session.user.id)
      .single();

    if (adminError || !admin) {
      return {
        success: false,
        error: 'Admin not found',
        code: 'NOT_FOUND',
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
        },
        expiresAt: data.session.expires_at ?? 0,
      },
    };
  } catch (error) {
    console.error('Error refreshing session:', error);

    return {
      success: false,
      error: getErrorMessage(error),
      code: 'INTERNAL_ERROR',
    };
  }
}
