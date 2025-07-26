"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Fish } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Some basic validation
    if (!phoneNumber || phoneNumber.trim() === '') {
      setError('Phone number is required');
      setIsLoading(false);
      return;
    }

    if (!password || password.trim() === '') {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    console.log('Attempting to login with:', { phoneNumber, password: '***' });

    try {
      console.log('Calling login function...');
      const success = await login(phoneNumber, password);
      console.log('Login result:', success);
        if (success) {
        toast({
          title: "Login successful",
          description: "Welcome to Ocean Fresh Admin Dashboard",
        });
        console.log('Login successful, redirecting to dashboard...');
        try {
          router.push('/dashboard');
          console.log('Router.push called successfully');
        } catch (routerError) {
          console.error('Router error during redirect:', routerError);
        }
      } else {
        console.error('Login failed in component');
        setError('Invalid phone number or password. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm sm:max-w-md shadow-lg">
      <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-center mb-4">
          <Fish className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <CardTitle className="text-xl sm:text-2xl text-center font-semibold">
          Ocean Fresh Admin
        </CardTitle>
        <CardDescription className="text-center text-sm">
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input 
              id="phoneNumber" 
              type="tel" 
              placeholder="9876543210" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mobile-form-input"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <a 
                href="#" 
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Forgot password?
              </a>
            </div>
            <Input 
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mobile-form-input"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full mobile-form-button mt-6" 
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center px-4 sm:px-6 pb-6">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}