const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const { verifyToken } = require('../middleware/auth');

router.get('/', cardController.getAll);
router.get('/:id', cardController.getOne);
router.post('/', verifyToken, cardController.create);
router.delete('/:id', verifyToken, cardController.delete);

module.exports = router; 