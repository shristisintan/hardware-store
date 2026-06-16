const db = require('../config/db');

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
    const { name, purchase_price, selling_price, stock } = req.body;

    try {
        await db.execute(
            `INSERT INTO products (name, purchase_price, selling_price, stock)
             VALUES (?, ?, ?, ?)`,
            [name, purchase_price, selling_price, stock]
        );

        res.json({ message: 'Product created successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};