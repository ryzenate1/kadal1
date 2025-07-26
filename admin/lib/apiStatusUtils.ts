"use client";

/**
 * Utility functions for checking API connection status
 */

// Base API URLs - use environment variable or default to localhost
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CLIENT_API_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';

/**
 * Check if the server API is reachable
 * @returns Promise<boolean>
 */
export async function checkServerApiStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${SERVER_API_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return response.ok;
  } catch (error) {
    console.error('Server API check failed:', error);
    return false;
  }
}

/**
 * Check if the client API is reachable
 * @returns Promise<boolean>
 */
export async function checkClientApiStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${CLIENT_API_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    return response.ok;
  } catch (error) {
    console.error('Client API check failed:', error);
    return false;
  }
}

/**
 * Get a user-friendly message based on API status
 * @param serverStatus Server API status
 * @param clientStatus Client API status
 * @returns string message
 */
export function getApiStatusMessage(serverStatus: boolean, clientStatus: boolean): string {
  if (serverStatus && clientStatus) {
    return "All systems operational";
  } else if (serverStatus) {
    return "Server connected, but client disconnected";
  } else if (clientStatus) {
    return "Client connected, but server disconnected";
  } else {
    return "Both server and client are disconnected";
  }
}

/**
 * Check all API connections and return status
 * @returns Promise<{server: boolean, client: boolean}>
 */
export async function checkAllApiConnections(): Promise<{server: boolean, client: boolean}> {
  const server = await checkServerApiStatus();
  const client = await checkClientApiStatus();
  
  return { server, client };
}

/**
 * Gets API status component props
 * @returns Promise<{status: string, serverConnected: boolean, clientConnected: boolean}>
 */
export async function getApiStatusProps(): Promise<{
  status: string, 
  serverConnected: boolean, 
  clientConnected: boolean
}> {
  const { server, client } = await checkAllApiConnections();
  
  return {
    status: getApiStatusMessage(server, client),
    serverConnected: server,
    clientConnected: client
  };
}
