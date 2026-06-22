const express = require('express');
const router = express.Router();

const profitController = require('../controllers/profit.controller');
const auth = require('../middleware/auth.middleware');

// 💰 PROFIT ROUTES
router.get('/total', auth.verifyToken, profitController.totalProfit);
router.get('/today', auth.verifyToken, profitController.todayProfit);
router.get('/invoice/:id', auth.verifyToken, profitController.profitPerInvoice);
router.get('/top-products', auth.verifyToken, profitController.topProfitProducts);

module.exports = router;