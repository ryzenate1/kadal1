'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Globe, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiEndpoint {
  name: string;
  url: string;
  method: string;
  description: string;
}

export default function ContentApiChecker() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [clientStatus, setClientStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [clientMessage, setClientMessage] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [clientResponseTime, setClientResponseTime] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const { toast } = useToast();

  const apiEndpoints: ApiEndpoint[] = [
    { 
      name: 'Homepage Components', 
      url: '/api/content/homepage-components', 
      method: 'GET',
      description: 'Retrieves all homepage components configuration'
    },
    { 
      name: 'Status Check', 
      url: '/api/status', 
      method: 'GET',
      description: 'Checks API status and connectivity'
    }
  ];

  // Client API URL is configured in .env
  const clientApiUrl = process.env.NEXT_PUBLIC_CLIENT_API_URL || 'http://localhost:3000';

  const checkApiEndpoint = async (endpoint: ApiEndpoint) => {
    setApiStatus('checking');
    setStatusMessage(`Checking ${endpoint.name} endpoint...`);
    setResponseTime(null);
    
    const startTime = performance.now();
    
    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      const endTime = performance.now();
      setResponseTime(Math.round(endTime - startTime));
      setLastChecked(new Date().toLocaleTimeString());
      
      if (response.ok) {
        const data = await response.json();        setApiStatus('success');
        setStatusMessage(`${endpoint.name} endpoint is responding properly`);
        
        toast({
          title: "API Endpoint Accessible",
          description: `${endpoint.name} is responding properly`,
          variant: "default",
        });

        return true;
      } else {
        setApiStatus('error');
        setStatusMessage(`Error: ${endpoint.name} returned status ${response.status}`);
        
        toast({
          title: "API Error",
          description: `${endpoint.name} returned status ${response.status}`,
          variant: "destructive",
        });

        return false;
      }
    } catch (error) {
      setApiStatus('error');
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Failed to connect to API'}`);
      setResponseTime(null);
      
      toast({
        title: "API Connection Failed",
        description: error instanceof Error ? error.message : 'Could not connect to API endpoint',
        variant: "destructive",
      });

      return false;
    }
  };

  const checkClientConnectivity = async () => {
    setClientStatus('checking');
    setClientMessage('Checking client connection...');
    setClientResponseTime(null);
    
    const startTime = performance.now();
    
    try {
      // Try to fetch from the client's content API
      const url = `${clientApiUrl}/api/content/refresh`;
      console.log('Checking client connectivity at:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      const endTime = performance.now();
      setClientResponseTime(Math.round(endTime - startTime));
      
      if (response.ok) {
        const data = await response.json();        setClientStatus('success');
        setClientMessage('Client API is accessible');
        
        toast({
          title: "Client Connection Successful",
          description: "Client API is accessible and responding properly",
          variant: "default",
        });

        return true;
      } else {
        setClientStatus('error');
        setClientMessage(`Error: Client API returned status ${response.status}`);
        
        toast({
          title: "Client Connection Error",
          description: `Client API returned status ${response.status}`,
          variant: "destructive",
        });

        return false;
      }
    } catch (error) {
      setClientStatus('error');
      setClientMessage(`Error: ${error instanceof Error ? error.message : 'Failed to connect to client API'}`);
      setClientResponseTime(null);
      
      toast({
        title: "Client Connection Failed",
        description: `${error instanceof Error ? error.message : 'Could not connect to client API'}. Make sure the client is running and CORS is properly configured.`,
        variant: "destructive",
      });

      return false;
    }
  };

  const verifyAllConnections = async () => {
    // Check admin API endpoints first
    let adminSuccess = false;
    for (const endpoint of apiEndpoints) {
      adminSuccess = await checkApiEndpoint(endpoint);
      if (!adminSuccess) break;
    }
    
    // Then check client connectivity
    if (adminSuccess) {
      await checkClientConnectivity();
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          API Connection Status
          <div className="flex gap-2">
            <Badge variant={apiStatus === 'success' ? 'success' : apiStatus === 'error' ? 'destructive' : 'outline'}>
              Admin API: {apiStatus === 'idle' ? 'Not Checked' : 
                apiStatus === 'checking' ? 'Checking...' : 
                apiStatus === 'success' ? 'Connected' : 'Failed'}
            </Badge>
            <Badge variant={clientStatus === 'success' ? 'success' : clientStatus === 'error' ? 'destructive' : 'outline'}>
              Client API: {clientStatus === 'idle' ? 'Not Checked' : 
                clientStatus === 'checking' ? 'Checking...' : 
                clientStatus === 'success' ? 'Connected' : 'Failed'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2 space-y-4">
        {apiStatus !== 'idle' && (
          <Alert variant={apiStatus === 'success' ? 'default' : 'destructive'} className="mt-2">
            <div className="flex items-center gap-2">
              {apiStatus === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>Admin API {apiStatus === 'success' ? 'Success' : 'Error'}</AlertTitle>
            </div>
            <AlertDescription className="mt-1">{statusMessage}</AlertDescription>
            {responseTime && (
              <div className="text-xs mt-2">
                Response time: {responseTime}ms
              </div>
            )}
            {lastChecked && (
              <div className="text-xs mt-1">
                Last checked: {lastChecked}
              </div>
            )}
          </Alert>
        )}
        
        {clientStatus !== 'idle' && (
          <Alert variant={clientStatus === 'success' ? 'default' : 'destructive'} className="mt-2">
            <div className="flex items-center gap-2">
              {clientStatus === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>Client API {clientStatus === 'success' ? 'Success' : 'Error'}</AlertTitle>
            </div>
            <AlertDescription className="mt-1">{clientMessage}</AlertDescription>
            {clientResponseTime && (
              <div className="text-xs mt-2">
                Response time: {clientResponseTime}ms
              </div>
            )}
          </Alert>
        )}
        
        {(apiStatus === 'success' && clientStatus === 'success') && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">All Systems Connected</AlertTitle>
            <AlertDescription className="text-green-600">
              Admin API and Client API are successfully connected. Content changes will be properly synchronized.
            </AlertDescription>
          </Alert>
        )}
        
        {(apiStatus === 'error' || clientStatus === 'error') && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-700">Connection Issues Detected</AlertTitle>
            <AlertDescription className="text-amber-600">
              There are issues with API connections. Content changes may not be properly synchronized between admin and client.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={verifyAllConnections}
          disabled={apiStatus === 'checking' || clientStatus === 'checking'}
          variant="default"
          className="w-full"
        >
          {(apiStatus === 'checking' || clientStatus === 'checking') ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Checking Connections...
            </>
          ) : (
            <>
              <Globe className="mr-2 h-4 w-4" />
              Verify All Connections
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => window.open(clientApiUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Client Site
        </Button>
      </CardFooter>
    </Card>
  );
}
