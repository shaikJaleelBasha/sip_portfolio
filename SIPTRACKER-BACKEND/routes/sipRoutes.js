const express = require('express');
const router = express.Router();
const authenticateUser = require("../middlewares/authMiddleware.js")
const sipController = require('../controller/sipController.js');

router.post('/', authenticateUser, sipController.createSIP);
router.get('/:sipId', authenticateUser, sipController.getSipById);
router.post('/:sipId/process', authenticateUser, sipController.processSips);
router.get('/:sipId/transactions', authenticateUser, sipController.getSIPTransactions);

module.exports = router;