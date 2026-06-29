const express = require('express');
const router = express.Router();

const customerController = require('../controllers/customer.controller');
const auth = require('../middleware/auth.middleware');

// CREATE CUSTOMER
router.post(
'/',
auth.verifyToken,
customerController.createCustomer
);

// GET ALL CUSTOMERS
router.get(
'/',
auth.verifyToken,
customerController.getAllCustomers
);

// SEARCH CUSTOMERS
router.get(
'/search',
auth.verifyToken,
customerController.searchCustomers
);

// CUSTOMER HISTORY
router.get(
'/:id/history',
auth.verifyToken,
customerController.getCustomerHistory
);

// CUSTOMER DUE SUMMARY
router.get(
'/:id/due-summary',
auth.verifyToken,
customerController.getCustomerDueSummary
);

// GET SINGLE CUSTOMER
router.get(
'/:id',
auth.verifyToken,
customerController.getCustomer
);

// UPDATE CUSTOMER
router.put(
'/:id',
auth.verifyToken,
customerController.updateCustomer
);

// DELETE CUSTOMER
router.delete(
'/:id',
auth.verifyToken,
customerController.deleteCustomer
);

module.exports = router;
