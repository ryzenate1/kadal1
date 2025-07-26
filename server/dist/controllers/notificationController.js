"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
exports.NotificationController = {
    // Create a new notification
    createNotification: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId, title, message, type, resourceType, resourceId, isRead } = req.body;
            if (!userId || !title || !message || !type || !resourceType) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const notification = yield notificationService_1.NotificationService.createNotification({
                userId,
                title,
                message,
                type,
                resourceType,
                resourceId,
                isRead
            });
            res.status(201).json(notification);
        }
        catch (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({ error: 'Failed to create notification' });
        }
    }),
    // Get notifications by user ID
    getNotificationsByUserId: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const notifications = yield notificationService_1.NotificationService.getNotificationsByUserId(userId, limit, offset);
            res.status(200).json(notifications);
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    }),
    // Mark a notification as read
    markAsRead: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const notification = yield notificationService_1.NotificationService.markAsRead(id);
            res.status(200).json(notification);
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    }),
    // Mark all notifications as read for a user
    markAllAsRead: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const result = yield notificationService_1.NotificationService.markAllAsRead(userId);
            res.status(200).json({ count: result.count });
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ error: 'Failed to mark all notifications as read' });
        }
    }),
    // Delete a notification
    deleteNotification: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            yield notificationService_1.NotificationService.deleteNotification(id);
            res.status(204).send();
        }
        catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ error: 'Failed to delete notification' });
        }
    }),
    // Get unread count for a user
    getUnreadCount: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const count = yield notificationService_1.NotificationService.getUnreadCount(userId);
            res.status(200).json({ count });
        }
        catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({ error: 'Failed to get unread count' });
        }
    })
};
