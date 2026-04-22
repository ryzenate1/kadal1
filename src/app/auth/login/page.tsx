"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useClerk, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-notification";

const getSafeRedirect = (raw: string | null): string => {
  if (!raw || !raw.startsWith('/')) return '/';
  if (raw.startsWith('//') || raw.startsWith('/\\')) return '/';
  return raw;
};

const getRedirectTarget = () => {
  if (typeof window === 'undefined') return '/';
  const urlParams = new URLSearchParams(window.location.search);
  return getSafeRedirect(urlParams.get('redirect') || urlParams.get('returnTo'));
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);

  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { isSignedIn } = useUser();
  const clerk = useClerk();
  const { showToast } = useToast();

  // Redirect already-authenticated users immediately — no modal, no flicker
  useEffect(() => {
    if (isAuthenticated || isSignedIn) {
      const redirectUrl = getRedirectTarget();
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, isSignedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      if (!identifier || !password) {
        setLoginError('Email/phone and password are required');
        return;
      }

      const result = await login(identifier, password);

      if (result.success) {
        showToast({
          message: result.message || 'Welcome to Kadal Thunai!',
          type: 'success',
          duration: 4000,
        });
        setRedirecting(true);
        router.push(getRedirectTarget());
      } else {
        setLoginError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      if (!redirecting) setIsLoading(false);
    }
  };

  // Handle Google sign-in via Clerk OAuth redirect (no modal — production-safe)
  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = getRedirectTarget();
      await clerk.redirectToSignIn({
        redirectUrl: `${window.location.origin}${redirectUrl}`,
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  };

  if (isAuthenticated || isSignedIn || redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600" />
        <p className="mt-4 text-gray-600">Redirecting you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-10 sm:px-6 lg:py-14 lg:px-8 login-container">
      <div className="w-full max-w-md">
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-md border border-gray-100">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo.png"
                alt="Kadal Thunai Logo"
                width={150}
                height={50}
                className="mx-auto h-auto w-[130px] sm:w-[150px]"
              />
            </Link>
            <h2 className="mt-5 text-2xl sm:text-[1.75rem] font-bold text-gray-900 leading-tight">
              Welcome to Kadal Thunai
            </h2>
            <p className="mt-2 text-sm sm:text-[15px] text-gray-600">
              Login to your account for a seamless seafood shopping experience
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Phone
              </label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter email or 10-digit phone"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="text-red-500 text-sm py-1">{loginError}</div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-600 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="my-4 flex items-center">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="px-3 text-xs text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-medium text-red-600 hover:text-red-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
