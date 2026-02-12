import { Metadata } from 'next';
import { LoginForm } from './login-form';
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Login - Pure Life Pools CRM',
  description: 'Sign in to your Pool Service CRM account',
};

/**
 * Login Page
 *
 * Server component that renders the login form.
 * Authentication is handled by the LoginForm client component.
 */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Logo and Title */}
      <div className="text-center">
         <Image width={30} height={80} alt="company logo" src="/images/logo.png" />
        <h1 className="text-2xl font-semibold text-zinc-900">Pure Life Pools CRM</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Sign in to manage your pool service business
        </p>
      </div>

      {/* Login Form */}
      <LoginForm />
    </div>
  );
}
