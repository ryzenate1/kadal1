import { useState, useEffect, useCallback } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { 
  Notification, 
  fetchUserNotifications, 
  fetchUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/lib/notificationUtils';
import { useAuth } from '@/context/AuthContext';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

export function useNotifications(pollingInterval = 30000) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserNotifications();
      setNotifications(data);
      
      // Update unread count
      const count = data.filter(notification => !notification.isRead).length;
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Prefer realtime updates; keep polling as a fallback.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      if (!pollingInterval) {
        return;
      }
      const intervalId = setInterval(() => {
        fetchNotifications();
      }, pollingInterval);
      return () => clearInterval(intervalId);
    }

    const channels: RealtimeChannel[] = [];
    const handleRealtimeChange = () => {
      fetchNotifications();
      refreshUnreadCount();
    };

    const profileChannel = supabase
      .channel(`notifications-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        handleRealtimeChange
      )
      .subscribe();
    channels.push(profileChannel);

    const orderChannel = supabase
      .channel(`notifications-orders-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `profile_id=eq.${user.id}`,
        },
        handleRealtimeChange
      )
      .subscribe();
    channels.push(orderChannel);

    return () => {
      channels.forEach((channel) => {
        channel.unsubscribe();
      });
    };
  }, [pollingInterval, fetchNotifications, refreshUnreadCount, isAuthenticated, user?.id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead
  };
}
