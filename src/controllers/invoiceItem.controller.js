const db = require('../config/db');

exports.addItem = async (req, res) => {
    const { invoice_id, product_id, quantity } = req.body;

    try {
        // Get product
        const [products] = await db.execute(
            'SELECT * FROM products WHERE id = ?',
            [product_id]
        );

        if (products.length === 0) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }

        const product = products[0];

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                message: 'Insufficient stock'
            });
        }

        const price = product.selling_price;
        const total = price * quantity;

        // Add item to invoice
        await db.execute(
            `INSERT INTO invoice_items
            (invoice_id, product_id, quantity, price, total)
            VALUES (?, ?, ?, ?, ?)`,
            [invoice_id, product_id, quantity, price, total]
        );

        // Reduce stock
        await db.execute(
            `UPDATE products
             SET stock = stock - ?
             WHERE id = ?`,
            [quantity, product_id]
        );

        res.json({
            message: 'Item added successfully',
            total
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};