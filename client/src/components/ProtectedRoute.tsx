import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Skip during initial load to avoid flash
    if (loading) return;
    
    console.log('ProtectedRoute: Auth state check - User:', !!user, 'Loading:', loading);
    
    if (!user) {
      console.log('ProtectedRoute: No authenticated user found, redirecting to login');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const encodedRedirect = encodeURIComponent(currentPath);
      router.push(`/auth/login?redirect=${encodedRedirect}`);
    } else {
      console.log('ProtectedRoute: User authenticated:', user.name);
      setVerified(true);
    }
  }, [user, loading, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Don't render until we've verified the user is authenticated
  if (!verified) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
