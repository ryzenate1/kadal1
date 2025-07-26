"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth = require('../../middleware/auth');
const router = express_1.default.Router();
// Create a new notification - requires authentication
router.post('/', auth, notificationController_1.NotificationController.createNotification);
// Get notifications by user ID - requires authentication
router.get('/user/:userId', auth, notificationController_1.NotificationController.getNotificationsByUserId);
// Mark a notification as read - requires authentication
router.put('/:id/read', auth, notificationController_1.NotificationController.markAsRead);
// Mark all notifications as read for a user - requires authentication
router.put('/user/:userId/read-all', auth, notificationController_1.NotificationController.markAllAsRead);
// Delete a notification - requires authentication
router.delete('/:id', auth, notificationController_1.NotificationController.deleteNotification);
// Get unread count for a user - requires authentication
router.get('/user/:userId/unread-count', auth, notificationController_1.NotificationController.getUnreadCount);
exports.default = router;
