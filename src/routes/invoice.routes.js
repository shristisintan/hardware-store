const express = require('express');
const router = express.Router();

const invoiceController = require('../controllers/invoice.controller');

router.post('/', invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoice);
router.get('/', invoiceController.getAllInvoices);

module.exports = router;