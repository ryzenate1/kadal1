import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

export const NotificationController = {
  // Create a new notification
  createNotification: async (req: Request, res: Response) => {
    try {
      const { userId, title, message, type, resourceType, resourceId, isRead } = req.body;
      
      if (!userId || !title || !message || !type || !resourceType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const notification = await NotificationService.createNotification({
        userId,
        title,
        message,
        type,
        resourceType,
        resourceId,
        isRead
      });
      
      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  },
  
  // Get notifications by user ID
  getNotificationsByUserId: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const notifications = await NotificationService.getNotificationsByUserId(userId, limit, offset);
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },
  
  // Mark a notification as read
  markAsRead: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const notification = await NotificationService.markAsRead(id);
      res.status(200).json(notification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  },
  
  // Mark all notifications as read for a user
  markAllAsRead: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const result = await NotificationService.markAllAsRead(userId);
      res.status(200).json({ count: result.count });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  },
  
  // Delete a notification
  deleteNotification: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await NotificationService.deleteNotification(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  },
  
  // Get unread count for a user
  getUnreadCount: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const count = await NotificationService.getUnreadCount(userId);
      res.status(200).json({ count });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ error: 'Failed to get unread count' });
    }
  }
};
