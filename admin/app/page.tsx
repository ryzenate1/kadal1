"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        console.log('User already logged in, redirecting to dashboard...');
        router.push('/dashboard');
      } else {
        console.log('User not logged in, redirecting to login...');
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      <p className="mt-2">Redirecting...</p>
    </div>
  );
}