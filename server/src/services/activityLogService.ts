import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ActivityLogService = {
  // Create a new activity log
  createLog: async (data: {
    userId: string;
    action: string;
    description: string;
    resourceType: string;
    resourceId?: string;
    metadata?: any;
  }) => {
    return prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        description: data.description,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      }
    });
  },

  // Get all activity logs
  getAllLogs: async (limit = 100, offset = 0) => {
    return prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
  },

  // Get activity logs by user ID
  getLogsByUserId: async (userId: string, limit = 50, offset = 0) => {
    return prisma.activityLog.findMany({
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

  // Get activity logs by resource (e.g., order ID, product ID)
  getLogsByResource: async (resourceType: string, resourceId: string, limit = 50, offset = 0) => {
    return prisma.activityLog.findMany({
      where: {
        resourceType,
        resourceId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
  }
};
