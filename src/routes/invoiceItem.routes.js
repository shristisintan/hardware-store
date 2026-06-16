const express = require('express');
const router = express.Router();

const invoiceItemController = require('../controllers/invoiceItem.controller');

router.post('/', invoiceItemController.addItem);

module.exports = router;