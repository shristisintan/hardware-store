const db = require("../config/db");

const nameRegex = /^[A-Za-z0-9 ]+$/;
const categoryRegex = /^[A-Za-z ]+$/;
const unitRegex = /^[A-Za-z]+$/;

const getProductData = (body) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  category: typeof body.category === "string" ? body.category.trim() : "",
  purchase_price: Number(body.purchase_price),
  stock: Number(body.stock),
  unit: typeof body.unit === "string" ? body.unit.trim() : "",
  low_stock_threshold: Number(body.low_stock_threshold),
  low_stock_limit: Number(body.low_stock_limit),
});

const validateProduct = (p) => {
  if (
    !p.name ||
    !p.category ||
    !p.unit ||
    !Number.isFinite(p.purchase_price) ||
    !Number.isFinite(p.stock) ||
    !Number.isFinite(p.low_stock_threshold) ||
    !Number.isFinite(p.low_stock_limit)
  ) {
    return "All fields are required.";
  }

  if (!nameRegex.test(p.name)) {
    return "Product name can contain letters, numbers and spaces only.";
  }

  if (!categoryRegex.test(p.category)) {
    return "Category can contain letters and spaces only.";
  }

  if (!unitRegex.test(p.unit)) {
    return "Unit can contain letters only.";
  }

  if (p.purchase_price < 0) {
    return "Purchase price cannot be negative.";
  }

  if (!Number.isInteger(p.stock) || p.stock < 0) {
    return "Stock must be a non-negative whole number.";
  }

  if (
    !Number.isInteger(p.low_stock_threshold) ||
    p.low_stock_threshold < 0
  ) {
    return "Low-stock threshold must be a non-negative whole number.";
  }

  if (
    !Number.isInteger(p.low_stock_limit) ||
    p.low_stock_limit < 0
  ) {
    return "Critical stock limit must be a non-negative whole number.";
  }

  if (p.low_stock_threshold <= p.low_stock_limit) {
    return "Low-stock threshold must be greater than the critical limit.";
  }

  return null;
};

exports.createProduct = async (req, res) => {
  try {
    const product = getProductData(req.body);
    const error = validateProduct(product);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const [existing] = await db.execute(
      `SELECT id FROM products WHERE LOWER(name) = LOWER(?)`,
      [product.name]
    );

    if (existing.length) {
      return res.status(409).json({
        message: "A product with this name already exists.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO products
       (name, category, purchase_price, stock, unit,
        low_stock_threshold, low_stock_limit)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product.name,
        product.category,
        product.purchase_price,
        product.stock,
        product.unit,
        product.low_stock_threshold,
        product.low_stock_limit,
      ]
    );

    res.status(201).json({
      message: "Product created successfully.",
      product_id: result.insertId,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error.",
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
        id,
        name,
        category,
        purchase_price,
        stock,
        unit,
        low_stock_threshold,
        low_stock_limit,
        created_at
      FROM products
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error.",
    });
  }
};

exports.updateProduct = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const product = getProductData(req.body);
    const error = validateProduct(product);

    if (error) {
      connection.release();
      return res.status(400).json({ message: error });
    }

    await connection.beginTransaction();

    const [existingProduct] = await connection.execute(
      `SELECT
        id,
        stock
       FROM products
       WHERE id = ?`,
      [id]
    );

    if (!existingProduct.length) {
      await connection.rollback();
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    const oldStock = Number(existingProduct[0].stock);
    const newStock = product.stock;

    const [duplicate] = await connection.execute(
      `SELECT id
       FROM products
       WHERE LOWER(name) = LOWER(?)
       AND id <> ?`,
      [product.name, id]
    );

    if (duplicate.length) {
      await connection.rollback();
      return res.status(409).json({
        message: "A product with this name already exists.",
      });
    }

    await connection.execute(
      `UPDATE products
       SET
         name = ?,
         category = ?,
         purchase_price = ?,
         stock = ?,
         unit = ?,
         low_stock_threshold = ?,
         low_stock_limit = ?
       WHERE id = ?`,
      [
        product.name,
        product.category,
        product.purchase_price,
        product.stock,
        product.unit,
        product.low_stock_threshold,
        product.low_stock_limit,
        id,
      ]
    );

    if (oldStock !== newStock) {
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
          id,
          req.user.id,
          Math.abs(newStock - oldStock),
          oldStock,
          newStock,
          "Stock adjustment",
        ]
      );
    }

    await connection.commit();

    res.json({
      message: "Product updated successfully.",
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);

    res.status(500).json({
      message: "Server error.",
    });
  } finally {
    connection.release();
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      `DELETE FROM products WHERE id = ?`,
      [id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Product deleted successfully.",
    });
  } catch (err) {
    console.error(err);

    if (
      err.code === "ER_ROW_IS_REFERENCED_2" ||
      err.code === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        message: "This product has sales history and cannot be deleted.",
      });
    }

    res.status(500).json({
      message: "Server error.",
    });
  }
};