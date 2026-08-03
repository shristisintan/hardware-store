
const db = require("../config/db");

const {
  recalculateInvoice,
} = require("../services/invoiceCalculator.service");

const {
  recordMovement,
} = require("../services/stockMovement.service");


// ===============================
// CREATE INVOICE
// ===============================
exports.createInvoice = async (req, res) => {
  const { customer_id } = req.body;
  const user_id = req.user.id;

  try {
    const invoiceNo =
      "INV-" + Date.now();

    const [result] = await db.execute(
      `INSERT INTO invoices (
        invoice_no,
        user_id,
        customer_id,
        total_amount,
        grand_total,
        paid_amount,
        due_amount,
        payment_status
      )
      VALUES (?, ?, ?, 0, 0, 0, 0, 'CREDIT')`,
      [
        invoiceNo,
        user_id,
        customer_id || null,
      ]
    );

    res.json({
      message: "Invoice created",
      invoice_id: result.insertId,
      invoice_no: invoiceNo,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};


// ===============================
// GET SINGLE INVOICE
// ===============================
exports.getInvoice = async (req, res) => {
  const invoiceId = req.params.id;

  try {
    const [invoiceRows] =
      await db.execute(
        `SELECT
          i.*,
          c.name AS customer_name,
          c.phone AS customer_phone,
          c.address AS customer_address,
          u.name AS prepared_by
         FROM invoices i
         LEFT JOIN customers c
           ON i.customer_id = c.id
         LEFT JOIN users u
           ON i.user_id = u.id
         WHERE i.id=?`,
        [invoiceId]
      );

    if (!invoiceRows.length) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const invoice =
      invoiceRows[0];

    const [items] =
      await db.execute(
        `SELECT
          ii.id,
          ii.product_id,
          p.name,
          ii.quantity,
          ii.price,
          ii.total
         FROM invoice_items ii
         JOIN products p
           ON ii.product_id=p.id
         WHERE ii.invoice_id=?`,
        [invoiceId]
      );

    res.json({
      invoice,
      items,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};


// ===============================
// GET ALL INVOICES
// ===============================
exports.getAllInvoices = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                i.*,
                c.name AS customer_name,
                c.phone AS customer_phone
            FROM invoices i
            LEFT JOIN customers c
                ON i.customer_id = c.id
            ORDER BY i.id DESC
        `);

        res.json(rows);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Unable to fetch invoices."
        });
    }
};

// ===============================
// FINALIZE INVOICE
// ===============================
exports.finalizeInvoice = async (
  req,
  res
) => {

  const { id } = req.params;

  const connection =
    await db.getConnection();

  try {

    await connection.beginTransaction();

    // ===============================
    // GET INVOICE
    // ===============================
    const [rows] =
      await connection.execute(
        `SELECT
          is_finalized,
          is_cancelled,
          grand_total,
          paid_amount
         FROM invoices
         WHERE id=?
         FOR UPDATE`,
        [id]
      );

    if (!rows.length) {

      await connection.rollback();

      return res.status(404).json({
        message:
          "Invoice not found.",
      });
    }

    const invoice =
      rows[0];

    if (invoice.is_cancelled) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Cancelled invoice cannot be finalized.",
      });
    }

    if (invoice.is_finalized) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Invoice already finalized.",
      });
    }

    // ===============================
    // MUST HAVE ITEMS
    // ===============================
    const [itemRows] =
      await connection.execute(
        `SELECT
          ii.id,
          ii.product_id,
          ii.quantity,
          p.name,
          p.stock
         FROM invoice_items ii
         JOIN products p
           ON ii.product_id=p.id
         WHERE ii.invoice_id=?`,
        [id]
      );

    if (!itemRows.length) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Cannot finalize an empty invoice.",
      });
    }

    // ===============================
    // GRAND TOTAL
    // ===============================
    if (
      Number(invoice.grand_total) <= 0
    ) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Invoice total must be greater than zero.",
      });
    }

    // ===============================
    // CHECK PAYMENT
    // ===============================
    const paid =
      Number(invoice.paid_amount || 0);

    if (
      paid < 0 ||
      paid >
        Number(invoice.grand_total)
    ) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Invalid payment amount.",
      });
    }

    // ===============================
    // DEDUCT STOCK
    // ===============================
    for (const item of itemRows) {

      // Lock the product row.
      const [productRows] =
        await connection.execute(
          `SELECT
            id,
            name,
            stock
           FROM products
           WHERE id=?
           FOR UPDATE`,
          [item.product_id]
        );

      if (!productRows.length) {

        await connection.rollback();

        return res.status(404).json({
          message:
            `Product ${item.name} no longer exists.`,
        });
      }

      const product =
        productRows[0];

      const stockBefore =
        Number(product.stock);

      const quantity =
        Number(item.quantity);

      // ===============================
      // FINAL STOCK CHECK
      // ===============================
      if (
        quantity >
        stockBefore
      ) {

        await connection.rollback();

        return res.status(400).json({
          message:
            `Insufficient stock for ${product.name}. Available: ${stockBefore}. Required: ${quantity}.`,
        });
      }

      const stockAfter =
        stockBefore - quantity;

      // ===============================
      // DEDUCT STOCK
      // ===============================
      await connection.execute(
        `UPDATE products
         SET stock=?
         WHERE id=?`,
        [
          stockAfter,
          product.id,
        ]
      );

      // ===============================
      // RECORD SALE MOVEMENT
      // ===============================
      await recordMovement(
        connection,
        {
          productId:
            product.id,

          userId:
            req.user.id,

          invoiceId:
            Number(id),

          type:
            "SALE",

          quantity,

          stockBefore,

          stockAfter,

          reason:
            "Invoice finalized",
        }
      );
    }

    // ===============================
    // FINALIZE
    // ===============================
    await connection.execute(
      `UPDATE invoices
       SET
         is_finalized=1,
         finalized_at=NOW()
       WHERE id=?`,
      [id]
    );

    await connection.commit();

    res.json({
      message:
        "Invoice finalized successfully.",

      invoice_id:
        id,
    });

  } catch (err) {

    await connection.rollback();

    console.error(err);

    res.status(500).json({
      error: err.message,
    });

  } finally {

    connection.release();
  }
};



// ===============================
// UPDATE PAYMENT
// ===============================
exports.updatePayment = async (req, res) => {
  const { id } = req.params;
  const { paid_amount } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // ===============================
    // GET INVOICE
    // ===============================
    const [rows] = await connection.execute(
      `SELECT
        grand_total,
        paid_amount,
        due_amount,
        payment_status,
        is_cancelled
       FROM invoices
       WHERE id=?
       FOR UPDATE`,
      [id]
    );

    if (!rows.length) {
      await connection.rollback();

      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const invoice = rows[0];

    // ===============================
    // CANCELLED CHECK
    // ===============================
    if (invoice.is_cancelled) {
      await connection.rollback();

      return res.status(400).json({
        message: "Invoice has been cancelled.",
      });
    }

    // ===============================
    // VALIDATE PAYMENT
    // ===============================
    if (
      paid_amount === undefined ||
      paid_amount === null ||
      paid_amount === ""
    ) {
      await connection.rollback();

      return res.status(400).json({
        message: "Payment amount is required.",
      });
    }

    const payment = Number(paid_amount);

    if (Number.isNaN(payment)) {
      await connection.rollback();

      return res.status(400).json({
        message: "Payment amount must be numeric.",
      });
    }

    if (payment <= 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "Payment amount must be greater than zero.",
      });
    }

    const currentPaid = Number(invoice.paid_amount || 0);
    const grandTotal = Number(invoice.grand_total || 0);
    const currentDue = Number(invoice.due_amount || 0);

    // ===============================
    // PAYMENT CANNOT EXCEED DUE
    // ===============================
    if (payment > currentDue) {
      await connection.rollback();

      return res.status(400).json({
        message: `Payment cannot exceed the current due amount of ${currentDue.toFixed(
          2
        )}.`,
      });
    }

    // ===============================
    // NEW TOTAL PAID
    // ===============================
    const newPaid = currentPaid + payment;

    const newDue = Math.max(
      grandTotal - newPaid,
      0
    );

    // ===============================
    // PAYMENT STATUS
    // ===============================
    let paymentStatus = "CREDIT";

    if (newDue === 0) {
      paymentStatus = "PAID";
    } else if (newPaid > 0) {
      paymentStatus = "PARTIAL";
    }

    // ===============================
    // UPDATE PAYMENT
    // ===============================
    await connection.execute(
      `UPDATE invoices
       SET
         paid_amount=?,
         due_amount=?,
         payment_status=?
       WHERE id=?`,
      [
        newPaid,
        newDue,
        paymentStatus,
        id,
      ]
    );

    await connection.commit();

    res.json({
      message: "Payment recorded successfully.",

      invoice_id: Number(id),

      payment_added: payment,

      paid_amount: newPaid,

      due_amount: newDue,

      grand_total: grandTotal,

      payment_status: paymentStatus,
    });

  } catch (err) {
    await connection.rollback();

    console.error(err);

    res.status(500).json({
      error: err.message,
    });

  } finally {
    connection.release();
  }
};


// ===============================
// APPLY DISCOUNT
// ===============================
exports.applyDiscount = async (
  req,
  res
) => {

  const { id } = req.params;

  let {
    discount_amount = 0,
    discount_percentage = null,
  } = req.body;

  const connection =
    await db.getConnection();

  try {

    await connection.beginTransaction();

    const [rows] =
      await connection.execute(
        `SELECT
          total_amount,
          is_cancelled,
          is_finalized
         FROM invoices
         WHERE id=?`,
        [id]
      );

    if (!rows.length) {

      await connection.rollback();

      return res.status(404).json({
        message:
          "Invoice not found.",
      });
    }

    const invoice =
      rows[0];

    if (invoice.is_cancelled) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Invoice has been cancelled.",
      });
    }

    if (invoice.is_finalized) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Invoice already finalized.",
      });
    }

    discount_amount =
      Number(discount_amount);

    if (
      Number.isNaN(discount_amount)
    ) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Discount must be numeric.",
      });
    }

    if (
      discount_amount < 0
    ) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Discount cannot be negative.",
      });
    }

    if (
      discount_amount >
      Number(invoice.total_amount)
    ) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Discount cannot exceed subtotal.",
      });
    }

    await connection.execute(
      `UPDATE invoices
       SET
         discount_amount=?,
         discount_percentage=?
       WHERE id=?`,
      [
        discount_amount,
        discount_percentage,
        id,
      ]
    );

    const totals =
      await recalculateInvoice(
        connection,
        id
      );

    await connection.commit();

    res.json({
      message:
        "Discount applied successfully.",

      discount_amount,

      discount_percentage,

      invoice_total:
        totals.totalAmount,

      grand_total:
        totals.grandTotal,

      due_amount:
        totals.dueAmount,

      payment_status:
        totals.paymentStatus,
    });

  } catch (err) {

    await connection.rollback();

    res.status(500).json({
      error: err.message,
    });

  } finally {

    connection.release();
  }
};


// ===============================
// CANCEL INVOICE
// ===============================
exports.cancelInvoice = async (
  req,
  res
) => {

  const { id } = req.params;

  const connection =
    await db.getConnection();

  try {

    await connection.beginTransaction();

    const [invoiceRows] =
      await connection.execute(
        `SELECT
          is_cancelled,
          is_finalized
         FROM invoices
         WHERE id=?
         FOR UPDATE`,
        [id]
      );

    if (!invoiceRows.length) {

      await connection.rollback();

      return res.status(404).json({
        message:
          "Invoice not found",
      });
    }

    const invoice =
      invoiceRows[0];

    // ===============================
    // FINALIZED INVOICES
    // ===============================
    if (invoice.is_finalized) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Finalized invoices cannot be cancelled here. Use a return/void process.",
      });
    }

    if (invoice.is_cancelled) {

      await connection.rollback();

      return res.status(400).json({
        message:
          "Invoice already cancelled",
      });
    }

    // ===============================
    // CANCEL DRAFT
    // ===============================
    await connection.execute(
      `UPDATE invoices
       SET is_cancelled=1
       WHERE id=?`,
      [id]
    );

    await connection.commit();

    res.json({
      message:
        "Draft invoice cancelled successfully.",
      invoice_id:
        id,
    });

  } catch (err) {

    await connection.rollback();

    console.error(err);

    res.status(500).json({
      error: err.message,
    });

  } finally {

    connection.release();
  }
};
