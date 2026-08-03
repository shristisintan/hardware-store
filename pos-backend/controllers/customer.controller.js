const db = require("../config/db");

const nameRegex = /^[A-Za-z\s]+$/;
const phoneRegex = /^9[678]\d{8}$/;

const validateCustomer = ({ name, phone, address }) => {
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Customer name is required.");
  } else {
    name = name.trim();

    if (!nameRegex.test(name)) {
      errors.push("Customer name can contain letters and spaces only.");
    }

    if (name.length < 2) {
      errors.push("Customer name must be at least 2 characters.");
    }

    if (name.length > 100) {
      errors.push("Customer name cannot exceed 100 characters.");
    }
  }

  if (!phone || typeof phone !== "string") {
    errors.push("Phone number is required.");
  } else if (!phoneRegex.test(phone.trim())) {
    errors.push("Enter a valid Nepal mobile number.");
  }

  if (
    address &&
    typeof address === "string" &&
    address.trim().length > 200
  ) {
    errors.push("Address cannot exceed 200 characters.");
  }

  return errors;
};

exports.createCustomer = async (req, res) => {
  try {
    let { name, phone, address } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    phone = typeof phone === "string" ? phone.trim() : "";
    address = typeof address === "string" ? address.trim() : null;

    const errors = validateCustomer({ name, phone, address });

    if (errors.length) {
      return res.status(400).json({ message: errors[0] });
    }

    const [existing] = await db.execute(
      `SELECT id FROM customers WHERE phone = ?`,
      [phone]
    );

    if (existing.length) {
      return res.status(409).json({
        message: "A customer with this phone number already exists.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO customers (name, phone, address)
       VALUES (?, ?, ?)`,
      [name, phone, address || null]
    );

    return res.status(201).json({
      message: "Customer created successfully",
      customer_id: result.insertId,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, phone, address } = req.body;

    const [customer] = await db.execute(
      `SELECT id FROM customers WHERE id = ?`,
      [id]
    );

    if (!customer.length) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    name = typeof name === "string" ? name.trim() : "";
    phone = typeof phone === "string" ? phone.trim() : "";
    address = typeof address === "string" ? address.trim() : null;

    const errors = validateCustomer({ name, phone, address });

    if (errors.length) {
      return res.status(400).json({
        message: errors[0],
      });
    }

    const [existing] = await db.execute(
      `SELECT id
       FROM customers
       WHERE phone = ?
       AND id <> ?`,
      [phone, id]
    );

    if (existing.length) {
      return res.status(409).json({
        message: "Another customer is already using this phone number.",
      });
    }

    await db.execute(
      `UPDATE customers
       SET name = ?, phone = ?, address = ?
       WHERE id = ?`,
      [name, phone, address || null, id]
    );

    return res.status(200).json({
      message: "Customer updated successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT *
       FROM customers
       ORDER BY id DESC`
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT *
       FROM customers
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `DELETE FROM customers
       WHERE id = ?`,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.searchCustomers = async (req, res) => {
  try {
    const keyword =
      typeof req.query.keyword === "string"
        ? req.query.keyword.trim()
        : "";

    if (!keyword) {
      return res.status(200).json([]);
    }

    const [rows] = await db.execute(
      `SELECT *
       FROM customers
       WHERE name LIKE ?
          OR phone LIKE ?
       ORDER BY name ASC`,
      [`%${keyword}%`, `%${keyword}%`]
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getCustomerHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [customerRows] = await db.execute(
      `SELECT *
       FROM customers
       WHERE id = ?`,
      [id]
    );

    if (!customerRows.length) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const [invoices] = await db.execute(
      `SELECT
        id,
        invoice_no,
        total_amount,
        discount_amount,
        grand_total,
        paid_amount,
        due_amount,
        payment_status,
        created_at,
        finalized_at
       FROM invoices
       WHERE customer_id = ?
         AND is_finalized = 1
         AND is_cancelled = 0
       ORDER BY created_at DESC`,
      [id]
    );

    const totalPurchases = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.grand_total || 0),
      0
    );

    const totalPaid = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.paid_amount || 0),
      0
    );

    const totalDue = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.due_amount || 0),
      0
    );

    return res.json({
      customer: customerRows[0],
      summary: {
        total_invoices: invoices.length,
        total_purchases: totalPurchases,
        total_paid: totalPaid,
        total_due: totalDue,
      },
      invoices,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getCustomerDueSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT
        c.id,
        c.name,
        c.phone,
        COALESCE(
          SUM(
            CASE
              WHEN i.is_finalized = 1
               AND i.is_cancelled = 0
              THEN i.grand_total
              ELSE 0
            END
          ), 0
        ) AS total_sales,
        COALESCE(
          SUM(
            CASE
              WHEN i.is_finalized = 1
               AND i.is_cancelled = 0
              THEN i.due_amount
              ELSE 0
            END
          ), 0
        ) AS total_due
       FROM customers c
       LEFT JOIN invoices i
         ON c.id = i.customer_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};