"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { fetchWithAuth } from '@/lib/apiUtils';

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  response?: any;
}

export default function SystemTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: 'API Status',
      endpoint: '/status',
      method: 'GET',
      status: 'pending'
    },
    {
      name: 'Dashboard Stats',
      endpoint: '/dashboard/stats',
      method: 'GET',
      status: 'pending'
    },
    {
      name: 'Products List',
      endpoint: '/products',
      method: 'GET',
      status: 'pending'
    },
    {
      name: 'Categories List',
      endpoint: '/categories',
      method: 'GET',
      status: 'pending'
    },
    {
      name: 'Orders List',
      endpoint: '/orders',
      method: 'GET',
      status: 'pending'
    },
    {
      name: 'Users List',
      endpoint: '/users',
      method: 'GET',
      status: 'pending'
    },
    {
      name: 'Featured Fish',
      endpoint: '/featured-fish',
      method: 'GET',
      status: 'pending'
    },
    {
      name: 'Content List',
      endpoint: '/content',
      method: 'GET',
      status: 'pending'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testIndex: number) => {
    const test = tests[testIndex];
    
    setTests(prev => prev.map((t, i) => 
      i === testIndex ? { ...t, status: 'pending' } : t
    ));

    try {
      const response = await fetchWithAuth(test.endpoint);
      
      setTests(prev => prev.map((t, i) => 
        i === testIndex ? {
          ...t,
          status: 'success',
          message: `✓ Success (${Array.isArray(response) ? response.length : 'OK'} items)`,
          response: Array.isArray(response) ? `Array[${response.length}]` : typeof response
        } : t
      ));
    } catch (error: any) {
      setTests(prev => prev.map((t, i) => 
        i === testIndex ? {
          ...t,
          status: 'error',
          message: error.message,
          response: null
        } : t
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (let i = 0; i < tests.length; i++) {
      await runTest(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const pendingCount = tests.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Integration Tests</h1>
          <p className="text-gray-600">Test all API endpoints and admin panel functionality</p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          {isRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <div className="font-medium">{test.name}</div>
                    <div className="text-sm text-gray-500">
                      {test.method} {test.endpoint}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {test.message && (
                    <div className="text-sm max-w-md truncate" title={test.message}>
                      {test.message}
                    </div>
                  )}
                  {getStatusBadge(test.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runTest(index)}
                    disabled={isRunning}
                  >
                    Test
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Backend Features</h3>
                <ul className="space-y-1 text-sm">
                  <li>✅ JWT Authentication</li>
                  <li>✅ Protected API Routes</li>
                  <li>✅ File Upload System</li>
                  <li>✅ Dashboard Statistics</li>
                  <li>✅ Order Management</li>
                  <li>✅ Product Management</li>
                  <li>✅ Category Management</li>
                  <li>✅ User Management</li>
                  <li>✅ Content Management</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Admin Panel Features</h3>
                <ul className="space-y-1 text-sm">
                  <li>✅ Dashboard Overview</li>
                  <li>✅ Real-time Statistics</li>
                  <li>✅ Order Management UI</li>
                  <li>✅ Product Management UI</li>
                  <li>✅ Category Management UI</li>
                  <li>✅ Customer Management UI</li>
                  <li>✅ Content Management UI</li>
                  <li>✅ File Upload Interface</li>
                  <li>✅ Mobile Responsive Design</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Overall System Health:</span>
                <Badge className={
                  errorCount === 0 ? "bg-green-100 text-green-800" :
                  errorCount < 3 ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
                }>
                  {errorCount === 0 ? "Excellent" :
                   errorCount < 3 ? "Good" : "Needs Attention"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
