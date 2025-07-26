import express from 'express';
import { NotificationController } from '../controllers/notificationController';
const auth = require('../../middleware/auth');

const router = express.Router();

// Create a new notification - requires authentication
router.post('/', auth, NotificationController.createNotification);

// Get notifications by user ID - requires authentication
router.get('/user/:userId', auth, NotificationController.getNotificationsByUserId);

// Mark a notification as read - requires authentication
router.put('/:id/read', auth, NotificationController.markAsRead);

// Mark all notifications as read for a user - requires authentication
router.put('/user/:userId/read-all', auth, NotificationController.markAllAsRead);

// Delete a notification - requires authentication
router.delete('/:id', auth, NotificationController.deleteNotification);

// Get unread count for a user - requires authentication
router.get('/user/:userId/unread-count', auth, NotificationController.getUnreadCount);

export default router;
