"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth"); // Assuming uploads should be admin-only
const uploadController_1 = require("../controllers/uploadController");
const router = express_1.default.Router();
// POST /api/upload/image
// This route will be used by the admin panel to upload product images
router.post('/image', auth_1.authenticate, auth_1.isAdmin, uploadController_1.uploadImage);
exports.default = router;
