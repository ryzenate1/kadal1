import { getUserIdFromAuth } from './apiUtils';

const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  resourceType: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}

// Fetch user notifications
export async function fetchUserNotifications(): Promise<Notification[]> {
  try {
    const userId = await getUserIdFromAuth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`/api/user/notifications`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch notifications');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Fetch unread notifications count
export async function fetchUnreadCount(): Promise<number> {
  try {
    const userId = await getUserIdFromAuth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${SERVER_API_URL}/notifications/user/${userId}/unread-count`, {
      headers: {
        'Authorization': 'Bearer admin-token',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch unread count');
    }

    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  try {
    const response = await fetch(`${SERVER_API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer admin-token',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark notification as read');
    }

    return response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  try {
    const userId = await getUserIdFromAuth();
    
    if (!userId) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${SERVER_API_URL}/notifications/user/${userId}/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer admin-token',
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark all notifications as read');
    }

    return response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}
