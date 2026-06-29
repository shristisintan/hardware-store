const express = require('express');
const router = express.Router();

const discountController = require('../controllers/discount.controller');
const auth = require('../middleware/auth.middleware');
const invoiceMiddleware = require('../middleware/invoice.middleware');

router.post(
    '/',
    auth.verifyToken,
    invoiceMiddleware.checkInvoiceExists,
    invoiceMiddleware.checkInvoiceNotLocked,
    discountController.applyDiscount
);

module.exports = router;
