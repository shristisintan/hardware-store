const express = require('express');
const router = express.Router();

const invoiceItemController = require('../controllers/invoiceItem.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth.verifyToken, invoiceItemController.addItem);

module.exports = router;