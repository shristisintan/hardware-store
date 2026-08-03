const express = require("express");
const router = express.Router();

const invoiceController = require("../controllers/invoice.controller");
const pdfController = require("../controllers/pdf.controller");
const auth = require("../middleware/auth.middleware");

// ===============================
// INVOICE
// ===============================
router.post(
  "/",
  auth.verifyToken,
  invoiceController.createInvoice
);

router.get(
  "/",
  auth.verifyToken,
  invoiceController.getAllInvoices
);

router.get(
  "/:id",
  auth.verifyToken,
  invoiceController.getInvoice
);

router.put(
  "/:id/payment",
  auth.verifyToken,
  invoiceController.updatePayment
);

router.put(
  "/:id/discount",
  auth.verifyToken,
  invoiceController.applyDiscount
);

router.post(
  "/:id/finalize",
  auth.verifyToken,
  invoiceController.finalizeInvoice
);

router.post(
  "/:id/cancel",
  auth.verifyToken,
  invoiceController.cancelInvoice
);

router.get(
  "/:id/pdf",
  auth.verifyToken,
  pdfController.generateInvoicePDF
);

module.exports = router;