import { Router } from 'express';

const router = Router();

// Simple status endpoint to check if the API is online
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API server is online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
