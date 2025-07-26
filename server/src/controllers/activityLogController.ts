import { Request, Response } from 'express';
import { ActivityLogService } from '../services/activityLogService';

export const ActivityLogController = {
  // Create a new activity log
  createLog: async (req: Request, res: Response) => {
    try {
      const { userId, action, description, resourceType, resourceId, metadata } = req.body;
      
      if (!userId || !action || !description || !resourceType) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const log = await ActivityLogService.createLog({
        userId,
        action,
        description,
        resourceType,
        resourceId,
        metadata
      });
      
      res.status(201).json(log);
    } catch (error) {
      console.error('Error creating activity log:', error);
      res.status(500).json({ error: 'Failed to create activity log' });
    }
  },
  
  // Get all activity logs
  getAllLogs: async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const logs = await ActivityLogService.getAllLogs(limit, offset);
      res.status(200).json(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
  },
  
  // Get activity logs by user ID
  getLogsByUserId: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const logs = await ActivityLogService.getLogsByUserId(userId, limit, offset);
      res.status(200).json(logs);
    } catch (error) {
      console.error('Error fetching user activity logs:', error);
      res.status(500).json({ error: 'Failed to fetch user activity logs' });
    }
  },
  
  // Get activity logs by resource
  getLogsByResource: async (req: Request, res: Response) => {
    try {
      const { resourceType, resourceId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const logs = await ActivityLogService.getLogsByResource(resourceType, resourceId, limit, offset);
      res.status(200).json(logs);
    } catch (error) {
      console.error('Error fetching resource activity logs:', error);
      res.status(500).json({ error: 'Failed to fetch resource activity logs' });
    }
  }
};
