const express = require("express");
const router = express.Router();

const invoiceItemController = require("../controllers/invoiceItem.controller");
const auth = require("../middleware/auth.middleware");
const invoiceMiddleware = require("../middleware/invoice.middleware");

// ===============================
// ADD ITEM
// ===============================
router.post(
  "/add",
  auth.verifyToken,
  invoiceMiddleware.checkInvoiceExists,
  invoiceMiddleware.checkInvoiceNotLocked,
  invoiceItemController.addItem
);

// ===============================
// UPDATE ITEM
// ===============================
router.put(
  "/:id",
  auth.verifyToken,
  invoiceItemController.updateItem
);

// ===============================
// DELETE ITEM
// ===============================
router.delete(
  "/:id",
  auth.verifyToken,
  invoiceItemController.deleteItem
);

module.exports = router;