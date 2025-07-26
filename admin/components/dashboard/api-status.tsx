"use client";

import { useEffect, useState, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { API_CLIENT_CONFIG } from '@/lib/enhancedApiUtils';

interface ApiStatus {
  server: 'connected' | 'disconnected' | 'checking';
  client: 'connected' | 'disconnected' | 'checking';
}

interface ApiStatusProps {
  endpoint: string; // e.g., 'categories', 'products', 'fish-picks'
  onRefresh?: () => void;
}

export function ApiStatus({ endpoint, onRefresh }: ApiStatusProps) {
  // Use centralized configuration
  const SERVER_API_URL = API_CLIENT_CONFIG.SERVER_API_URL;
  const CLIENT_API_URL = API_CLIENT_CONFIG.CLIENT_API_URL;
  
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    server: 'checking',
    client: 'checking'
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  // Check API connections
  const checkApiConnections = useCallback(async () => {
    setApiStatus(prev => ({ ...prev, server: 'checking', client: 'checking' }));
    
    // Check server connection
    try {
      const serverRes = await fetch(`${SERVER_API_URL}/${endpoint}`, { 
        method: 'HEAD', // Use HEAD request to minimize data transfer
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      setApiStatus(prev => ({ ...prev, server: serverRes.ok ? 'connected' : 'disconnected' }));
    } catch (error) {
      console.error(`Server API connection error for ${endpoint}:`, error);
      setApiStatus(prev => ({ ...prev, server: 'disconnected' }));
    }

    // Check client connection
    try {
      const clientRes = await fetch(`${CLIENT_API_URL}/${endpoint}`, { 
        method: 'HEAD', // Use HEAD request to minimize data transfer
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      setApiStatus(prev => ({ ...prev, client: clientRes.ok ? 'connected' : 'disconnected' }));
    } catch (error) {
      console.error(`Client API connection error for ${endpoint}:`, error);
      setApiStatus(prev => ({ ...prev, client: 'disconnected' }));
    }
    
    // Set last checked time
    setLastChecked(new Date().toLocaleTimeString());
  }, [endpoint, SERVER_API_URL, CLIENT_API_URL]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkApiConnections();
    if (onRefresh) {
      await onRefresh();
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkApiConnections();
  }, [checkApiConnections]);

  return (
    <div className="flex flex-wrap gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Client API:</span>
        <Badge variant={apiStatus.client === 'connected' ? 'success' : 'destructive'} className="flex items-center gap-1">
          {apiStatus.client === 'checking' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Checking</span>
            </>
          ) : apiStatus.client === 'connected' ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3" />
              <span>Disconnected</span>
            </>
          )}
        </Badge>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.open(`${CLIENT_API_URL}/${endpoint}`, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open client API in new tab</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Server API:</span>
        <Badge variant={apiStatus.server === 'connected' ? 'success' : 'destructive'} className="flex items-center gap-1">
          {apiStatus.server === 'checking' ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Checking</span>
            </>
          ) : apiStatus.server === 'connected' ? (
            <>
              <CheckCircle2 className="h-3 w-3" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3 w-3" />
              <span>Disconnected</span>
            </>
          )}
        </Badge>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => window.open(`${SERVER_API_URL}/${endpoint}`, '_blank')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open server API in new tab</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="ml-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center gap-1"
        >
          {isRefreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span>Refresh</span>
        </Button>
      </div>
    </div>
  );
}
