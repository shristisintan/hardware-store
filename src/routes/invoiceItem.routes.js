const express = require('express');
const router = express.Router();

const invoiceItemController = require('../controllers/invoiceItem.controller');
const auth = require('../middleware/auth.middleware');
const invoiceMiddleware = require('../middleware/invoice.middleware');

router.post(
    '/add',
    invoiceMiddleware.checkInvoiceExists,
    invoiceMiddleware.checkInvoiceNotLocked,
    invoiceItemController.addItem
);

module.exports = router;