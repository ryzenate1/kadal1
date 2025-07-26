"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const activityLogController_1 = require("../controllers/activityLogController");
const auth = require('../../middleware/auth');
const router = express_1.default.Router();
// Create a new activity log - requires authentication
router.post('/', auth, activityLogController_1.ActivityLogController.createLog);
// Get all activity logs - requires authentication
router.get('/', auth, activityLogController_1.ActivityLogController.getAllLogs);
// Get activity logs by user ID - requires authentication
router.get('/user/:userId', auth, activityLogController_1.ActivityLogController.getLogsByUserId);
// Get activity logs by resource - requires authentication
router.get('/resource/:resourceType/:resourceId', auth, activityLogController_1.ActivityLogController.getLogsByResource);
exports.default = router;
