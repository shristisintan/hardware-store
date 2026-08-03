const express = require("express");
const router = express.Router();

const stockController = require("../controllers/stock.controller");
const auth = require("../middleware/auth.middleware");

router.get(
  "/movements",
  auth.verifyToken,
  stockController.getStockMovements
);

router.post(
  "/purchase",
  auth.verifyToken,
  stockController.purchaseStock
);

router.post(
  "/adjust",
  auth.verifyToken,
  stockController.adjustStock
);

module.exports = router;