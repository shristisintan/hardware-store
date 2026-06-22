const express = require('express');
const router = express.Router();

const invoiceController = require('../controllers/invoice.controller');
const auth = require('../middleware/auth.middleware');
const pdfController = require('../controllers/pdf.controller');
console.log("invoiceController:", invoiceController);


// PROTECTED ROUTES
router.post('/', auth.verifyToken, invoiceController.createInvoice);
router.get('/:id', auth.verifyToken, invoiceController.getInvoice);
router.get('/', auth.verifyToken, invoiceController.getAllInvoices);
router.post('/:id/finalize', invoiceController.finalizeInvoice);
router.post('/:id/cancel', invoiceController.cancelInvoice);
router.get('/:id/pdf', auth.verifyToken, pdfController.generateInvoicePDF);

module.exports = router;