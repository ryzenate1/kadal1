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
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.NotificationService = {
    // Create a new notification
    createNotification: (data) => __awaiter(void 0, void 0, void 0, function* () {
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
    }),
    // Get all notifications for a user
    getNotificationsByUserId: (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, limit = 50, offset = 0) {
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
    }),
    // Mark a notification as read
    markAsRead: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }),
    // Mark all notifications as read for a user
    markAllAsRead: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: { isRead: true }
        });
    }),
    // Delete a notification
    deleteNotification: (id) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.notification.delete({
            where: { id }
        });
    }),
    // Get unread count for a user
    getUnreadCount: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });
    })
};
