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
exports.ActivityLogController = void 0;
const activityLogService_1 = require("../services/activityLogService");
exports.ActivityLogController = {
    // Create a new activity log
    createLog: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId, action, description, resourceType, resourceId, metadata } = req.body;
            if (!userId || !action || !description || !resourceType) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const log = yield activityLogService_1.ActivityLogService.createLog({
                userId,
                action,
                description,
                resourceType,
                resourceId,
                metadata
            });
            res.status(201).json(log);
        }
        catch (error) {
            console.error('Error creating activity log:', error);
            res.status(500).json({ error: 'Failed to create activity log' });
        }
    }),
    // Get all activity logs
    getAllLogs: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const logs = yield activityLogService_1.ActivityLogService.getAllLogs(limit, offset);
            res.status(200).json(logs);
        }
        catch (error) {
            console.error('Error fetching activity logs:', error);
            res.status(500).json({ error: 'Failed to fetch activity logs' });
        }
    }),
    // Get activity logs by user ID
    getLogsByUserId: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const logs = yield activityLogService_1.ActivityLogService.getLogsByUserId(userId, limit, offset);
            res.status(200).json(logs);
        }
        catch (error) {
            console.error('Error fetching user activity logs:', error);
            res.status(500).json({ error: 'Failed to fetch user activity logs' });
        }
    }),
    // Get activity logs by resource
    getLogsByResource: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { resourceType, resourceId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const logs = yield activityLogService_1.ActivityLogService.getLogsByResource(resourceType, resourceId, limit, offset);
            res.status(200).json(logs);
        }
        catch (error) {
            console.error('Error fetching resource activity logs:', error);
            res.status(500).json({ error: 'Failed to fetch resource activity logs' });
        }
    })
};
