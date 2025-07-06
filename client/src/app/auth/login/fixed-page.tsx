"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-notification";

export default function Login() {
  // State for form values
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newUser, setNewUser] = useState(false);

  // UI state
  const [loginError, setLoginError] = useState<string>('');
  const [signupError, setSignupError] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [otpLoginError, setOtpLoginError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();
  const { login, register, sendOtp, loginWithOtp, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Get the redirect URL from query parameters or default to home page
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect') || '/';
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!phoneNumber || !password) {
        setLoginError('Phone number and password are required');
        setIsLoading(false);
        return;
      }
      
      // Attempt login
      const result = await login(phoneNumber, password);
      
      if (result.success) {
        // Show success toast
        showToast({
          message: result.message || 'Welcome to Kadal Thunai! You have successfully logged in.',
          type: 'success',
          duration: 5000
        });
        
        // Mark as redirecting to prevent UI flicker
        setRedirecting(true);
        
        // Get the redirect URL from query parameters or default to home page
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || '/';
        
        // Use router.push for smoother navigation
        router.push(redirectUrl);
      } else {
        setLoginError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      if (!redirecting) {
        setIsLoading(false);
      }
    }
  };

  const handleSendOtp = async () => {
    setOtpError('');
    setIsLoading(true);

    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
      setOtpError('Please enter a valid 10-digit phone number');
      setIsLoading(false);
      return;
    }

    try {
      const result = await sendOtp(phoneNumber);
      
      if (result.success) {
        setOtpSent(true);
        setNewUser(!result.userExists);
        showToast({
          message: 'OTP sent successfully to your phone',
          type: 'success'
        });
      } else {
        setOtpError(result.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setOtpError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoginError('');
    setIsLoading(true);

    try {
      // If this is a new user, we need to collect name and email
      const userData = newUser ? { name, email } : undefined;
      
      const result = await loginWithOtp(phoneNumber, otp, userData);
      
      if (result.success) {
        showToast({
          message: result.message || 'Login successful!',
          type: 'success'
        });
        
        // Mark as redirecting
        setRedirecting(true);
        
        // Get the redirect URL from query parameters or default to home page
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || '/';
        
        router.push(redirectUrl);
      } else {
        setOtpLoginError(result.message || 'OTP verification failed. Please try again.');
      }
    } catch (error) {
      setOtpLoginError('An unexpected error occurred. Please try again.');
      console.error('OTP login error:', error);
    } finally {
      if (!redirecting) {
        setIsLoading(false);
      }
    }
  };

  // If already authenticated or redirecting, show a loading state
  if (isAuthenticated || redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="mt-4 text-lg text-gray-700">Redirecting you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 login-container">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Kadal Thunai Logo"
                width={150}
                height={50}
                className="mx-auto"
              />
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              Welcome to Kadal Thunai
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Login to your account for a seamless seafood shopping experience
            </p>
          </div>

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="password">Password Login</TabsTrigger>
              <TabsTrigger value="otp">OTP Login</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full"
                    maxLength={10}
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
                      onClick={toggleShowPassword}
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
                      className="h-4 w-4 text-tendercuts-red focus:ring-tendercuts-red border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="font-medium text-tendercuts-red hover:text-red-700"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-tendercuts-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tendercuts-red"
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
            </TabsContent>

            <TabsContent value="otp">
              {!otpSent ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phoneForOtp" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="phoneForOtp"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full"
                      maxLength={10}
                      required
                    />
                  </div>

                  {otpError && (
                    <div className="text-red-500 text-sm py-1">{otpError}</div>
                  )}

                  <Button
                    type="button"
                    onClick={handleSendOtp}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-tendercuts-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tendercuts-red"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...
                      </span>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleOtpLogin} className="space-y-4">
                  {newUser && (
                    <>
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
                          className="w-full"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full"
                          required
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      Enter OTP sent to {phoneNumber}
                    </label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full"
                      maxLength={6}
                      required
                    />
                  </div>

                  {otpLoginError && (
                    <div className="text-red-500 text-sm py-1">{otpLoginError}</div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-sm font-medium text-tendercuts-red hover:text-red-700"
                      onClick={() => setOtpSent(false)}
                    >
                      Change Phone Number
                    </button>
                    <button
                      type="button"
                      className="text-sm font-medium text-tendercuts-red hover:text-red-700"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-tendercuts-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tendercuts-red"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                      </span>
                    ) : (
                      "Verify & Login"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-tendercuts-red hover:text-red-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
