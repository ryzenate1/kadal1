"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Simple status endpoint to check if the API is online
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'API server is online',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
exports.default = router;
