const express = require('express');
const router = express.Router();

const invoiceController = require('../controllers/invoice.controller');
const auth = require('../middleware/auth.middleware');

// PROTECTED ROUTES
router.post('/', auth.verifyToken, invoiceController.createInvoice);
router.get('/:id', auth.verifyToken, invoiceController.getInvoice);
router.get('/', auth.verifyToken, invoiceController.getAllInvoices);

module.exports = router;