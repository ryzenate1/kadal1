import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const NotificationService = {
  // Create a new notification
  createNotification: async (data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    resourceType: string;
    resourceId?: string;
    isRead?: boolean;
  }) => {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type, // 'order', 'profile', 'system', etc.
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        isRead: data.isRead || false
      }
    });
  },

  // Get all notifications for a user
  getNotificationsByUserId: async (userId: string, limit = 50, offset = 0) => {
    return prisma.notification.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
  },
  
  // Mark a notification as read
  markAsRead: async (id: string) => {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  },
  
  // Mark all notifications as read for a user
  markAllAsRead: async (userId: string) => {
    return prisma.notification.updateMany({
      where: { 
        userId,
        isRead: false
      },
      data: { isRead: true }
    });
  },
  
  // Delete a notification
  deleteNotification: async (id: string) => {
    return prisma.notification.delete({
      where: { id }
    });
  },
  
  // Get unread count for a user
  getUnreadCount: async (userId: string) => {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }
};
