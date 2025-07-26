import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function OrderNotificationsSetup() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported in this browser
    if ('Notification' in window) {
      setIsSupported(true);
      setNotificationPermission(Notification.permission);
      
      // Check if notifications are already enabled
      const storedPreference = localStorage.getItem('enableOrderNotifications');
      if (storedPreference === 'true') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('enableOrderNotifications', 'true');
        
        // Send a test notification
        new Notification('Notifications Enabled', {
          body: 'You will now receive notifications for order updates',
          icon: '/images/logo.png'
        });
        
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive notifications for order updates',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Notification Permission Denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: 'Error Enabling Notifications',
        description: 'There was a problem enabling notifications',
        variant: 'destructive',
      });
    }
  };

  const toggleNotifications = () => {
    if (!notificationsEnabled) {
      if (notificationPermission !== 'granted') {
        requestNotificationPermission();
      } else {
        setNotificationsEnabled(true);
        localStorage.setItem('enableOrderNotifications', 'true');
        toast({
          title: 'Notifications Enabled',
          description: 'You will now receive notifications for order updates',
          variant: 'default',
        });
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('enableOrderNotifications', 'false');
      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive notifications for order updates',
        variant: 'default',
      });
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Order Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <BellOff className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Push notifications are not supported in your browser.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md">Order Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium">Real-time Order Alerts</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Receive notifications when order status changes
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={toggleNotifications}
              disabled={notificationPermission === 'denied'}
            />
          </div>
          
          {notificationPermission === 'denied' && (
            <div className="rounded-md bg-amber-50 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <BellOff className="h-4 w-4 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Notification Access Blocked</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      You've blocked notifications for this site. Please update your browser settings to enable notifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
