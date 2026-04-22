"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMessage(data?.message || "If this email exists, a reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your registered email. We will send a password reset link.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>
          {message && <p className="text-sm text-green-700">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </span>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
        <Link href="/auth/login" className="mt-4 inline-block text-sm text-red-600 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
