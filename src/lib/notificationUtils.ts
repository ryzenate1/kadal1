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
    const response = await fetch(`/api/user/notifications/feed`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch notifications');
    }

    const data = await response.json();
    return Array.isArray(data?.notifications) ? data.notifications : [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Fetch unread notifications count
export async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await fetch(`/api/user/notifications/feed`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch unread count');
    }

    const data = await response.json();
    return Number(data?.unreadCount || 0);
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string): Promise<Notification> {
  try {
    const response = await fetch(`/api/user/notifications/feed`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notificationId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark notification as read');
    }

    return {
      id: notificationId,
      userId: '',
      title: '',
      message: '',
      type: 'order_status',
      resourceType: 'order_status',
      isRead: true,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  try {
    const response = await fetch(`/api/user/notifications/feed`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action: 'markAllRead' })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark all notifications as read');
    }

    const data = await response.json();
    return { count: Number(data?.unreadCount || 0) };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}
