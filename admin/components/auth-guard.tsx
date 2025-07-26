"use client";

import { useAuth } from "@/components/auth-provider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    console.log("AuthGuard checking authorization:", {
      user,
      isLoading,
      pathname,
    });
    
    // If we're not loading anymore and the user isn't logged in
    // and we're not already on the login page, redirect to login
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        console.log("Redirecting to login page from:", pathname);
        router.push("/login");
      } else if (user && pathname === "/login") {
        console.log("Redirecting to dashboard from login page");
        router.push("/dashboard");
      } else {
        console.log("User is authorized to access:", pathname);
        setIsAuthorized(true);
      }
    }
  }, [user, isLoading, pathname, router]);
  
  // Show nothing while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  // For login page, allow access regardless of auth status
  if (pathname === "/login") {
    return <>{children}</>;
  }
  
  // For other pages, only show content if authorized
  return isAuthorized ? <>{children}</> : null;
}
