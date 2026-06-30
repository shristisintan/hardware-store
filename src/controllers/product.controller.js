const db = require('../config/db');

// ===============================
// CREATE PRODUCT
// ===============================
exports.createProduct = async (req, res) => {
    let { name, category, purchase_price, stock, unit } = req.body;

    try {
        // Validation
        if (!name || !category || purchase_price == null || stock == null || !unit) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        if (
            typeof name !== 'string' ||
            typeof category !== 'string' ||
            typeof unit !== 'string'
        ) {
            return res.status(400).json({
                message: 'Name, category and unit must be text'
            });
        }

        name = name.trim();
        category = category.trim();
        unit = unit.trim();

        purchase_price = Number(purchase_price);
        stock = Number(stock);

        if (!name || !category || !unit) {
            return res.status(400).json({
                message: 'Fields cannot be empty'
            });
        }

        if (isNaN(purchase_price) || isNaN(stock)) {
            return res.status(400).json({
                message: 'Purchase price and stock must be numbers'
            });
        }

        if (purchase_price <= 0) {
            return res.status(400).json({
                message: 'Purchase price must be greater than 0'
            });
        }

        if (stock < 0) {
            return res.status(400).json({
                message: 'Stock cannot be negative'
            });
        }

        const [result] = await db.execute(
            `INSERT INTO products
            (name, category, purchase_price, stock, unit)
            VALUES (?, ?, ?, ?, ?)`,
            [name, category, purchase_price, stock, unit]
        );

        res.status(201).json({
            message: 'Product created successfully',
            product_id: result.insertId
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// ===============================
// GET ALL PRODUCTS
// ===============================
exports.getAllProducts = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT *
             FROM products
             ORDER BY id DESC`
        );

        res.status(200).json(rows);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};