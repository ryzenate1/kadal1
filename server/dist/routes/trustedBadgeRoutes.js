"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trustedBadgeController_1 = require("../controllers/trustedBadgeController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Public routes - available to everyone
router.get('/', trustedBadgeController_1.getAllTrustedBadges);
router.get('/:id', trustedBadgeController_1.getTrustedBadgeById);
// Protected routes - admin only
router.post('/', auth_1.authenticate, auth_1.isAdmin, trustedBadgeController_1.createTrustedBadge);
router.put('/:id', auth_1.authenticate, auth_1.isAdmin, trustedBadgeController_1.updateTrustedBadge);
router.delete('/:id', auth_1.authenticate, auth_1.isAdmin, trustedBadgeController_1.deleteTrustedBadge);
exports.default = router;
