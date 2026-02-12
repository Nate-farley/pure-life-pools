'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { login } from '@/app/actions/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/forms/form';

/**
 * Login Form Component
 *
 * Client component that handles user authentication.
 * Uses react-hook-form with Zod validation.
 */
export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const handleSubmit = React.useCallback(
    async (data: LoginInput) => {
      setError(null);
      setIsSubmitting(true);

      try {
        const result = await login(data);

        if (result.success) {
          toast.success(`Welcome back, ${result.data.fullName}!`);
          window.location.href = '/admin'
        } else {
          // @ts-ignore
          setError(result.error);

          // Focus email field for retry
          // @ts-ignore
          if (result.code === 'INVALID_CREDENTIALS') {
            form.setFocus('email');
          }
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, form]
  );

  const togglePasswordVisibility = React.useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              // @ts-ignore
              <Alert variant="error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="admin@example.com"
                        autoComplete="email"
                        className="pl-10"
                        // @ts-ignore
                        error={!!form.formState.errors.email}
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="pl-10 pr-10"
                        // @ts-ignore
                        error={!!form.formState.errors.password}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
