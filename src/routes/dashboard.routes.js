const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const auth = require('../middleware/auth.middleware');

// Dashboard APIs (protected)
router.get('/sales-today', auth.verifyToken, dashboardController.getTodaySales);
router.get('/invoices-today', auth.verifyToken, dashboardController.getTodayInvoices);
router.get('/stock-value', auth.verifyToken, dashboardController.getStockValue);
router.get('/top-products', auth.verifyToken, dashboardController.getTopProducts);

module.exports = router;