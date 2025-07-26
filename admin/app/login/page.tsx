"use client";

import { useEffect } from 'react';
import LoginForm from '@/components/auth/login-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import Script from 'next/script';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      console.log('User already logged in, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);
  
  return (
    <>
      <Script src="/auth-middleware.js" strategy="beforeInteractive" />
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <LoginForm />
      </div>
    </>
  );
}
