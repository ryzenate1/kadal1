import express from 'express';
import { ActivityLogController } from '../controllers/activityLogController';
const auth = require('../../middleware/auth');

const router = express.Router();

// Create a new activity log - requires authentication
router.post('/', auth, ActivityLogController.createLog);

// Get all activity logs - requires authentication
router.get('/', auth, ActivityLogController.getAllLogs);

// Get activity logs by user ID - requires authentication
router.get('/user/:userId', auth, ActivityLogController.getLogsByUserId);

// Get activity logs by resource - requires authentication
router.get('/resource/:resourceType/:resourceId', auth, ActivityLogController.getLogsByResource);

export default router;
