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
exports.ActivityLogService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.ActivityLogService = {
    // Create a new activity log
    createLog: (data) => __awaiter(void 0, void 0, void 0, function* () {
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
    }),
    // Get all activity logs
    getAllLogs: (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 100, offset = 0) {
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
    }),
    // Get activity logs by user ID
    getLogsByUserId: (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, limit = 50, offset = 0) {
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
    }),
    // Get activity logs by resource (e.g., order ID, product ID)
    getLogsByResource: (resourceType_1, resourceId_1, ...args_1) => __awaiter(void 0, [resourceType_1, resourceId_1, ...args_1], void 0, function* (resourceType, resourceId, limit = 50, offset = 0) {
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
    })
};
