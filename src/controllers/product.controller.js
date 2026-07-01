const db = require("../config/db");

// ===============================
// VALIDATION HELPERS
// ===============================
const isValidText = (value) => /^[a-zA-Z0-9 ]+$/.test(value);
const isValidCategory = (value) => /^[a-zA-Z ]+$/.test(value);
const isValidUnit = (value) => /^[a-zA-Z]+$/.test(value);

// ===============================
// CREATE PRODUCT
// ===============================
exports.createProduct = async (req, res) => {
  try {
    let { name, category, purchase_price, stock, unit } = req.body;

    if (!name || !category || purchase_price == null || stock == null || !unit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    name = name.trim();
    category = category.trim();
    unit = unit.trim();

    purchase_price = Number(purchase_price);
    stock = Number(stock);

    if (!name || !category || !unit) {
      return res.status(400).json({ message: "Fields cannot be empty" });
    }

    if (!isValidText(name)) {
      return res.status(400).json({
        message: "Product name can only contain letters, numbers and spaces",
      });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({
        message: "Category can only contain letters and spaces",
      });
    }

    if (!isValidUnit(unit)) {
      return res.status(400).json({
        message: "Unit can only contain letters",
      });
    }

    if (isNaN(purchase_price) || isNaN(stock)) {
      return res.status(400).json({
        message: "Price and stock must be valid numbers",
      });
    }

    if (purchase_price < 0) {
      return res.status(400).json({
        message: "Purchase price cannot be negative",
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        message: "Stock cannot be negative",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO products (name, category, purchase_price, stock, unit)
       VALUES (?, ?, ?, ?, ?)`,
      [name, category, purchase_price, stock, unit]
    );

    return res.status(201).json({
      message: "Product created successfully",
      product_id: result.insertId,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ===============================
// GET ALL PRODUCTS
// ===============================
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM products ORDER BY id DESC`
    );

    return res.status(200).json(rows);

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ===============================
// UPDATE PRODUCT
// ===============================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, category, purchase_price, stock, unit } = req.body;

    if (!name || !category || purchase_price == null || stock == null || !unit) {
      return res.status(400).json({ message: "All fields are required" });
    }

    name = name.trim();
    category = category.trim();
    unit = unit.trim();

    purchase_price = Number(purchase_price);
    stock = Number(stock);

    if (!isValidText(name)) {
      return res.status(400).json({
        message: "Product name invalid",
      });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({
        message: "Category invalid",
      });
    }

    if (!isValidUnit(unit)) {
      return res.status(400).json({
        message: "Unit invalid",
      });
    }

    if (isNaN(purchase_price) || isNaN(stock)) {
      return res.status(400).json({
        message: "Price and stock must be numbers",
      });
    }

    if (purchase_price < 0 || stock < 0) {
      return res.status(400).json({
        message: "Values cannot be negative",
      });
    }

    const [result] = await db.execute(
      `UPDATE products
       SET name=?, category=?, purchase_price=?, stock=?, unit=?
       WHERE id=?`,
      [name, category, purchase_price, stock, unit, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ===============================
// DELETE PRODUCT
// ===============================
exports.deleteProduct = async (req, res) => {
      console.log("DELETE HIT PARAM:", req.params.id);

  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `DELETE FROM products WHERE id=?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};