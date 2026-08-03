const db = require("../config/db");

// ===============================
// PURCHASE STOCK
// ===============================
exports.purchaseStock = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { product_id, quantity, reason } = req.body;
    const user_id = req.user.id;

    const productId = Number(product_id);
    const purchaseQuantity = Number(quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Invalid product." });
    }

    if (!Number.isInteger(purchaseQuantity) || purchaseQuantity <= 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Purchase quantity must be a positive whole number.",
      });
    }

    const cleanReason =
      reason && String(reason).trim()
        ? String(reason).trim()
        : "Stock purchase";

    if (cleanReason.length > 255) {
      await connection.rollback();
      return res.status(400).json({
        message: "Reason cannot exceed 255 characters.",
      });
    }

    const [rows] = await connection.execute(
      `SELECT id, name, stock
       FROM products
       WHERE id = ?`,
      [productId]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const product = rows[0];
    const stockBefore = Number(product.stock);
    const stockAfter = stockBefore + purchaseQuantity;

    // Add stock
    await connection.execute(
      `UPDATE products
       SET stock = ?
       WHERE id = ?`,
      [stockAfter, productId]
    );

    // Record movement
    await connection.execute(
      `INSERT INTO stock_movements
       (
         product_id,
         user_id,
         invoice_id,
         type,
         quantity,
         stock_before,
         stock_after,
         reason
       )
       VALUES (?, ?, NULL, 'PURCHASE', ?, ?, ?, ?)`,
      [
        productId,
        user_id,
        purchaseQuantity,
        stockBefore,
        stockAfter,
        cleanReason,
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: "Stock purchased successfully.",
      product_id: productId,
      product_name: product.name,
      quantity: purchaseQuantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
      reason: cleanReason,
    });
  } catch (err) {
    await connection.rollback();

    console.error(err);

    res.status(500).json({
      message: "Failed to purchase stock.",
    });
  } finally {
    connection.release();
  }
};

// ===============================
// STOCK ADJUSTMENT
// ===============================
exports.adjustStock = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { product_id, quantity, reason } = req.body;
    const user_id = req.user.id;

    const productId = Number(product_id);
    const adjustment = Number(quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Invalid product.",
      });
    }

    if (!Number.isInteger(adjustment) || adjustment === 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Adjustment must be a non-zero whole number.",
      });
    }

    if (!reason || !String(reason).trim()) {
      await connection.rollback();
      return res.status(400).json({
        message: "Reason is required.",
      });
    }

    const cleanReason = String(reason).trim();

    if (cleanReason.length > 255) {
      await connection.rollback();
      return res.status(400).json({
        message: "Reason cannot exceed 255 characters.",
      });
    }

    const [rows] = await connection.execute(
      `SELECT id, name, stock
       FROM products
       WHERE id = ?`,
      [productId]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const product = rows[0];
    const stockBefore = Number(product.stock);
    const stockAfter = stockBefore + adjustment;

    if (stockAfter < 0) {
      await connection.rollback();
      return res.status(400).json({
        message: `Adjustment would make stock negative. Current stock is ${stockBefore}.`,
      });
    }

    // Update stock
    await connection.execute(
      `UPDATE products
       SET stock = ?
       WHERE id = ?`,
      [stockAfter, productId]
    );

    // Record movement
    await connection.execute(
      `INSERT INTO stock_movements
       (
         product_id,
         user_id,
         invoice_id,
         type,
         quantity,
         stock_before,
         stock_after,
         reason
       )
       VALUES (?, ?, NULL, 'ADJUSTMENT', ?, ?, ?, ?)`,
      [
        productId,
        user_id,
        adjustment,
        stockBefore,
        stockAfter,
        cleanReason,
      ]
    );

    await connection.commit();

    res.json({
      message: "Stock adjusted successfully.",
      product_id: productId,
      product_name: product.name,
      quantity: adjustment,
      stock_before: stockBefore,
      stock_after: stockAfter,
      reason: cleanReason,
    });
  } catch (err) {
    await connection.rollback();

    console.error(err);

    res.status(500).json({
      message: "Failed to adjust stock.",
    });
  } finally {
    connection.release();
  }
};

// ===============================
// STOCK RETURN
// ===============================
exports.returnStock = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      product_id,
      quantity,
      invoice_id,
      reason,
    } = req.body;

    const user_id = req.user.id;

    const productId = Number(product_id);
    const returnQuantity = Number(quantity);
    const invoiceId =
      invoice_id == null ? null : Number(invoice_id);

    if (!Number.isInteger(productId) || productId <= 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Invalid product.",
      });
    }

    if (
      !Number.isInteger(returnQuantity) ||
      returnQuantity <= 0
    ) {
      await connection.rollback();
      return res.status(400).json({
        message: "Return quantity must be a positive whole number.",
      });
    }

    if (
      invoice_id != null &&
      (!Number.isInteger(invoiceId) || invoiceId <= 0)
    ) {
      await connection.rollback();
      return res.status(400).json({
        message: "Invalid invoice.",
      });
    }

    const cleanReason =
      reason && String(reason).trim()
        ? String(reason).trim()
        : "Customer return";

    if (cleanReason.length > 255) {
      await connection.rollback();
      return res.status(400).json({
        message: "Reason cannot exceed 255 characters.",
      });
    }

    const [rows] = await connection.execute(
      `SELECT id, name, stock
       FROM products
       WHERE id = ?`,
      [productId]
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const product = rows[0];
    const stockBefore = Number(product.stock);
    const stockAfter = stockBefore + returnQuantity;

    // Add returned stock
    await connection.execute(
      `UPDATE products
       SET stock = ?
       WHERE id = ?`,
      [stockAfter, productId]
    );

    // Record movement
    await connection.execute(
      `INSERT INTO stock_movements
       (
         product_id,
         user_id,
         invoice_id,
         type,
         quantity,
         stock_before,
         stock_after,
         reason
       )
       VALUES (?, ?, ?, 'RETURN', ?, ?, ?, ?)`,
      [
        productId,
        user_id,
        invoiceId,
        returnQuantity,
        stockBefore,
        stockAfter,
        cleanReason,
      ]
    );

    await connection.commit();

    res.json({
      message: "Stock returned successfully.",
      product_id: productId,
      product_name: product.name,
      quantity: returnQuantity,
      stock_before: stockBefore,
      stock_after: stockAfter,
      invoice_id: invoiceId,
      reason: cleanReason,
    });
  } catch (err) {
    await connection.rollback();

    console.error(err);

    res.status(500).json({
      message: "Failed to return stock.",
    });
  } finally {
    connection.release();
  }
};

// ===============================
// GET STOCK MOVEMENTS
// ===============================
exports.getStockMovements = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        sm.id,
        sm.product_id,
        p.name AS product_name,
        sm.user_id,
        u.name AS user_name,
        sm.invoice_id,
        sm.type,
        sm.quantity,
        sm.stock_before,
        sm.stock_after,
        sm.reason,
        sm.created_at
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.user_id = u.id
      ORDER BY sm.id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to fetch stock movements.",
    });
  }
};