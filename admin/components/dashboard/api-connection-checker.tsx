'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { fetchWithAuth } from '@/lib/enhancedApiUtils';

interface ApiConnectionCheckerProps {
  adminClientConnected?: boolean;
  serverConnected?: boolean;
  onCheckComplete?: (adminConnected: boolean, serverConnected: boolean) => void;
}

export default function ApiConnectionChecker({ 
  adminClientConnected = false, 
  serverConnected = false,
  onCheckComplete
}: ApiConnectionCheckerProps) {
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [adminStatus, setAdminStatus] = useState<boolean>(adminClientConnected);
  const [serverStatus, setServerStatus] = useState<boolean>(serverConnected);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  // Use environment variable with fallback
  const SERVER_API_URL = process.env.NEXT_PUBLIC_SERVER_API_URL || 'http://localhost:5001/api';

  const checkApiConnection = useCallback(async () => {
    setApiStatus('checking');
    setStatusMessage('Checking API connection...');
    setResponseTime(null);
    
    const startTime = performance.now();
    let adminConnected = false;
    let serverApiConnected = false;
    
    try {
      // Check admin client API (local Next.js API routes)
      try {
        const adminResponse = await fetch('/api/status', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
        
        adminConnected = adminResponse.ok;
        setAdminStatus(adminConnected);
        
        if (adminResponse.ok) {
          await adminResponse.json();
        }
      } catch (adminError) {
        console.error('Admin API error:', adminError);
        adminConnected = false;
        setAdminStatus(false);
      }
      
      // Check server API (Express server)
      try {
        const serverResponse = await fetch(`${SERVER_API_URL}/status`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });
        
        serverApiConnected = serverResponse.ok;
        setServerStatus(serverApiConnected);
        
        if (serverResponse.ok) {
          await serverResponse.json();
        }
      } catch (serverError) {
        console.error('Server API error:', serverError);
        serverApiConnected = false;
        setServerStatus(false);
      }
      
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setLastChecked(new Date().toLocaleTimeString());
      
      if (adminConnected && serverApiConnected) {
        setApiStatus('success');
        setStatusMessage('All API connections are working properly');
      } else if (adminConnected || serverApiConnected) {
        setApiStatus('success');
        setStatusMessage('Some API connections are working, but not all');
      } else {
        setApiStatus('error');
        setStatusMessage('All API connections are failing');
      }
      
      if (onCheckComplete) {
        onCheckComplete(adminConnected, serverApiConnected);
      }
    } catch (error) {
      setApiStatus('error');
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Failed to connect to API'}`);
      setResponseTime(null);
      setAdminStatus(false);
      setServerStatus(false);
      
      if (onCheckComplete) {
        onCheckComplete(false, false);
      }
    }
  }, [SERVER_API_URL, onCheckComplete]);

  // Auto-check on component mount
  useEffect(() => {
    checkApiConnection();
  }, [checkApiConnection]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Alert variant={adminClientConnected ? "default" : "destructive"}>
          <div className="flex items-center">
            {adminClientConnected ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            <AlertTitle>Admin Client API:</AlertTitle>
          </div>
          <AlertDescription>
            {adminClientConnected ? "Connected" : "Disconnected"}
          </AlertDescription>
        </Alert>

        <Alert variant={serverConnected ? "default" : "destructive"}>
          <div className="flex items-center">
            {serverConnected ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            <AlertTitle>Server API:</AlertTitle>
          </div>
          <AlertDescription>
            {serverConnected ? "Connected" : "Disconnected"}
          </AlertDescription>
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            API Connection Status
            <Badge variant={apiStatus === 'success' ? 'success' : apiStatus === 'checking' ? 'outline' : 'destructive'} className="ml-2">
              {apiStatus === 'idle' && 'Not Checked'}
              {apiStatus === 'checking' && 'Checking...'}
              {apiStatus === 'success' && 'Connected'}
              {apiStatus === 'error' && 'Failed'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {statusMessage}
            </div>
            {responseTime !== null && (
              <div className="text-sm">
                Response time: <span className="font-medium">{responseTime}ms</span>
              </div>
            )}
            {lastChecked && (
              <div className="text-sm text-muted-foreground">
                Last checked: {lastChecked}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={checkApiConnection} 
            disabled={apiStatus === 'checking'} 
            className="w-full"
          >
            {apiStatus === 'checking' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Connection
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
