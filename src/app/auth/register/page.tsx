"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/toast-notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const getSafeRedirect = (raw: string | null): string => {
  if (!raw || !raw.startsWith("/")) return "/";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw;
};

const getRedirectTarget = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return getSafeRedirect(urlParams.get("redirect") || urlParams.get("returnTo"));
};

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const redirectUrl = getRedirectTarget();
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    if (!name.trim()) return "Full name is required";
    if (!email.trim()) return "Email is required";
    if (!phoneNumber.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(phoneNumber)) return "Phone number must be 10 digits";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(name.trim(), email.trim(), phoneNumber.trim(), password);

      if (!result.success) {
        setError(result.message || "Registration failed. Please try again.");
        return;
      }

      showToast({
        message: result.message || "Registration successful. Welcome to Kadal Thunai!",
        type: "success",
        duration: 4500,
      });

      setRedirecting(true);
      const redirectUrl = getRedirectTarget();
      router.push(redirectUrl);
    } catch (err) {
      console.error("Register error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      if (!redirecting) {
        setIsLoading(false);
      }
    }
  };

  if (isAuthenticated || redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
        <p className="mt-4 text-lg text-gray-700">Redirecting you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:py-10 sm:px-6 lg:py-14 lg:px-8">
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
            <h1 className="mt-5 text-2xl sm:text-[1.75rem] font-bold text-gray-900 leading-tight">
              Create your account
            </h1>
            <p className="mt-2 text-sm sm:text-[15px] text-gray-600">
              Sign up to order fresh seafood faster
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                placeholder="Enter 10-digit phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm py-1">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-tendercuts-red hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>

            <div id="clerk-captcha" />
          </form>

          <div className="mt-5 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-tendercuts-red hover:text-red-700"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
