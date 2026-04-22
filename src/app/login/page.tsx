"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginRedirect() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [manualRedirect, setManualRedirect] = useState(false);

  useEffect(() => {
    console.log("Login redirect page rendered");
    
    // Create a countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Try to redirect
          try {
            router.push("/auth/login");
          } catch (error) {
            console.error("Failed to auto-redirect:", error);
            setManualRedirect(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Try to redirect
    try {
      // This will run immediately but we keep the timer for fallback
      router.push("/auth/login");
    } catch (error) {
      console.error("Failed to redirect immediately:", error);
      // Let the countdown continue
    }

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <h1 className="text-2xl font-bold mb-4">Redirecting to Login Page</h1>
        
        {countdown > 0 ? (
          <p className="mb-6">You will be redirected in {countdown} seconds...</p>
        ) : manualRedirect ? (
          <>
            <p className="mb-6 text-red-600">Automatic redirect failed.</p>
            <Link 
              href="/auth/login" 
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Click here to go to login page
            </Link>
          </>
        ) : (
          <p className="mb-6">Redirecting now...</p>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          <p>If you're not redirected automatically, please make sure JavaScript is enabled in your browser.</p>
        </div>
      </div>
    </div>
  );
}
