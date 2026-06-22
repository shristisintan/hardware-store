const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customer.controller');
const auth = require('../middleware/auth.middleware');

router.post(
    '/',
    auth.verifyToken,
    customerController.createCustomer
);

router.get(
    '/',
    auth.verifyToken,
    customerController.getAllCustomers
);

router.get(
    '/:id',
    auth.verifyToken,
    customerController.getCustomer
);

module.exports = router;