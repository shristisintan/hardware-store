
const db = require("../config/db");
const {
  recalculateInvoice,
} = require("../services/invoiceCalculator.service");

const fail = async (connection, res, status, message) => {
  await connection.rollback();
  return res.status(status).json({ message });
};

// ===============================
// ADD ITEM TO DRAFT
// ===============================
exports.addItem = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let {
      invoice_id,
      product_id,
      quantity,
      selling_price,
    } = req.body;

    invoice_id = Number(invoice_id);
    product_id = Number(product_id);
    quantity = Number(quantity);
    selling_price = Number(selling_price);

    if (
      !Number.isInteger(invoice_id) ||
      invoice_id <= 0 ||
      !Number.isInteger(product_id) ||
      product_id <= 0
    ) {
      return fail(connection, res, 400, "Invalid invoice or product.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return fail(
        connection,
        res,
        400,
        "Quantity must be a positive whole number."
      );
    }

    if (Number.isNaN(selling_price) || selling_price <= 0) {
      return fail(
        connection,
        res,
        400,
        "Selling price must be greater than zero."
      );
    }

    if (
      !/^\d+(\.\d{1,2})?$/.test(String(selling_price)) ||
      selling_price > 100000000
    ) {
      return fail(
        connection,
        res,
        400,
        "Selling price must have at most 2 decimal places."
      );
    }

    // ===============================
    // CHECK INVOICE
    // ===============================
    const [invoiceRows] = await connection.execute(
      `SELECT is_finalized, is_cancelled
       FROM invoices
       WHERE id=?`,
      [invoice_id]
    );

    if (!invoiceRows.length) {
      return fail(connection, res, 404, "Invoice not found.");
    }

    const invoice = invoiceRows[0];

    if (invoice.is_finalized) {
      return fail(
        connection,
        res,
        400,
        "Invoice has already been finalized."
      );
    }

    if (invoice.is_cancelled) {
      return fail(
        connection,
        res,
        400,
        "Cannot modify a cancelled invoice."
      );
    }

    // ===============================
    // CHECK PRODUCT
    // ===============================
    const [productRows] = await connection.execute(
      `SELECT id, name, stock
       FROM products
       WHERE id=?`,
      [product_id]
    );

    if (!productRows.length) {
      return fail(connection, res, 404, "Product not found.");
    }

    const product = productRows[0];

    // ===============================
    // CHECK CURRENT DRAFT QUANTITY
    // ===============================
    const [existingRows] = await connection.execute(
      `SELECT COALESCE(SUM(quantity), 0) AS quantity
       FROM invoice_items
       WHERE invoice_id=?
       AND product_id=?`,
      [invoice_id, product_id]
    );

    const existingQuantity = Number(
      existingRows[0].quantity || 0
    );

    const requestedQuantity =
      existingQuantity + quantity;

    if (requestedQuantity > Number(product.stock)) {
      return fail(
        connection,
        res,
        400,
        `Only ${product.stock} ${product.name} available in stock.`
      );
    }

    // ===============================
    // ADD ITEM
    // ===============================
    const total = quantity * selling_price;

    const [insertResult] = await connection.execute(
      `INSERT INTO invoice_items
       (invoice_id, product_id, quantity, price, total)
       VALUES (?, ?, ?, ?, ?)`,
      [
        invoice_id,
        product_id,
        quantity,
        selling_price,
        total,
      ]
    );

    const totals = await recalculateInvoice(
      connection,
      invoice_id
    );

    await connection.commit();

    res.status(201).json({
      message: "Product added successfully.",

      item: {
        id: insertResult.insertId,
        invoice_id,
        product_id,
        product_name: product.name,
        quantity,
        selling_price,
        total,
      },

      invoice: {
        total_amount: totals.totalAmount,
        grand_total: totals.grandTotal,
        due_amount: totals.dueAmount,
        payment_status: totals.paymentStatus,
      },
    });

  } catch (err) {
    await connection.rollback();

    console.error(err);

    res.status(500).json({
      message: "Failed to add invoice item.",
      error: err.message,
    });

  } finally {
    connection.release();
  }
};


// ===============================
// UPDATE ITEM
// ===============================
exports.updateItem = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const itemId = Number(req.params.id);
    const quantity = Number(req.body.quantity);
    const selling_price = Number(
      req.body.selling_price
    );

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return fail(
        connection,
        res,
        400,
        "Invalid invoice item."
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return fail(
        connection,
        res,
        400,
        "Quantity must be a positive whole number."
      );
    }

    if (
      Number.isNaN(selling_price) ||
      selling_price <= 0
    ) {
      return fail(
        connection,
        res,
        400,
        "Selling price must be greater than zero."
      );
    }

    if (
      !/^\d+(\.\d{1,2})?$/.test(
        String(selling_price)
      )
    ) {
      return fail(
        connection,
        res,
        400,
        "Selling price must have at most 2 decimal places."
      );
    }

    // ===============================
    // GET ITEM
    // ===============================
    const [itemRows] = await connection.execute(
      `SELECT *
       FROM invoice_items
       WHERE id=?`,
      [itemId]
    );

    if (!itemRows.length) {
      return fail(
        connection,
        res,
        404,
        "Invoice item not found."
      );
    }

    const item = itemRows[0];

    // ===============================
    // CHECK INVOICE
    // ===============================
    const [invoiceRows] = await connection.execute(
      `SELECT is_finalized, is_cancelled
       FROM invoices
       WHERE id=?`,
      [item.invoice_id]
    );

    if (!invoiceRows.length) {
      return fail(
        connection,
        res,
        404,
        "Invoice not found."
      );
    }

    const invoice = invoiceRows[0];

    if (invoice.is_finalized) {
      return fail(
        connection,
        res,
        400,
        "Invoice already finalized."
      );
    }

    if (invoice.is_cancelled) {
      return fail(
        connection,
        res,
        400,
        "Invoice already cancelled."
      );
    }

    // ===============================
    // CHECK CURRENT STOCK
    // ===============================
    const [productRows] = await connection.execute(
      `SELECT id, name, stock
       FROM products
       WHERE id=?`,
      [item.product_id]
    );

    if (!productRows.length) {
      return fail(
        connection,
        res,
        404,
        "Product not found."
      );
    }

    const product = productRows[0];

    // Other draft quantities for this product
    const [draftRows] = await connection.execute(
      `SELECT COALESCE(SUM(quantity), 0) AS quantity
       FROM invoice_items
       WHERE invoice_id=?
       AND product_id=?
       AND id<>?`,
      [
        item.invoice_id,
        item.product_id,
        itemId,
      ]
    );

    const otherDraftQuantity = Number(
      draftRows[0].quantity || 0
    );

    const requestedTotal =
      otherDraftQuantity + quantity;

    if (
      requestedTotal >
      Number(product.stock)
    ) {
      return fail(
        connection,
        res,
        400,
        `Only ${product.stock} ${product.name} available in stock.`
      );
    }

    // ===============================
    // UPDATE ITEM
    // ===============================
    const total =
      quantity * selling_price;

    await connection.execute(
      `UPDATE invoice_items
       SET
         quantity=?,
         price=?,
         total=?
       WHERE id=?`,
      [
        quantity,
        selling_price,
        total,
        itemId,
      ]
    );

    const totals =
      await recalculateInvoice(
        connection,
        item.invoice_id
      );

    await connection.commit();

    res.json({
      message:
        "Invoice item updated successfully.",
      invoice: totals,
    });

  } catch (err) {
    await connection.rollback();

    console.error(err);

    res.status(500).json({
      message:
        "Unable to update invoice item.",
      error: err.message,
    });

  } finally {
    connection.release();
  }
};


// ===============================
// DELETE ITEM
// ===============================
exports.deleteItem = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return fail(
        connection,
        res,
        400,
        "Invalid invoice item."
      );
    }

    const [rows] = await connection.execute(
      `SELECT *
       FROM invoice_items
       WHERE id=?`,
      [itemId]
    );

    if (!rows.length) {
      return fail(
        connection,
        res,
        404,
        "Invoice item not found."
      );
    }

    const item = rows[0];

    const [invoiceRows] = await connection.execute(
      `SELECT is_finalized, is_cancelled
       FROM invoices
       WHERE id=?`,
      [item.invoice_id]
    );

    if (!invoiceRows.length) {
      return fail(
        connection,
        res,
        404,
        "Invoice not found."
      );
    }

    const invoice = invoiceRows[0];

    if (invoice.is_finalized) {
      return fail(
        connection,
        res,
        400,
        "Cannot modify a finalized invoice."
      );
    }

    if (invoice.is_cancelled) {
      return fail(
        connection,
        res,
        400,
        "Cannot modify a cancelled invoice."
      );
    }

    // ===============================
    // DELETE ONLY
    // ===============================
    // Stock is NOT changed because
    // draft invoices never reserved it.
    await connection.execute(
      `DELETE FROM invoice_items
       WHERE id=?`,
      [itemId]
    );

    const totals =
      await recalculateInvoice(
        connection,
        item.invoice_id
      );

    await connection.commit();

    res.json({
      message:
        "Invoice item removed successfully.",
      invoice: totals,
    });

  } catch (err) {
    await connection.rollback();

    console.error(err);

    res.status(500).json({
      message:
        "Failed to delete invoice item.",
      error: err.message,
    });

  } finally {
    connection.release();
  }
};
