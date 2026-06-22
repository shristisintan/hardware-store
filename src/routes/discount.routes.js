const express = require('express');
const router = express.Router();

const discountController = require('../controllers/discount.controller');
const invoiceMiddleware = require('../middleware/invoice.middleware');

router.post(
    '/',
    invoiceMiddleware.checkInvoiceExists,
    invoiceMiddleware.checkInvoiceNotLocked,
    discountController.applyDiscount
);

module.exports = router;