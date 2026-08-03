const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer.controller");
const auth = require("../middleware/auth.middleware");

router.post(
  "/",
  auth.verifyToken,
  customerController.createCustomer
);

router.get(
  "/",
  auth.verifyToken,
  customerController.getAllCustomers
);

router.get(
  "/search",
  auth.verifyToken,
  customerController.searchCustomers
);

router.get(
  "/:id/history",
  auth.verifyToken,
  customerController.getCustomerHistory
);

router.get(
  "/:id/due-summary",
  auth.verifyToken,
  customerController.getCustomerDueSummary
);

router.get(
  "/:id",
  auth.verifyToken,
  customerController.getCustomer
);

router.put(
  "/:id",
  auth.verifyToken,
  customerController.updateCustomer
);

router.delete(
  "/:id",
  auth.verifyToken,
  customerController.deleteCustomer
);

module.exports = router;