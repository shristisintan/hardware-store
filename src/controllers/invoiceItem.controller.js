const db = require('../config/db');

exports.addItem = async (req, res) => {
    const { invoice_id, product_id, quantity, selling_price } = req.body;

    try {
        // validation
        if (!invoice_id || !product_id || !quantity || !selling_price) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // get product
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

        // stock check
        if (product.stock < quantity) {
            return res.status(400).json({
                message: 'Insufficient stock'
            });
        }

        const total = Number(selling_price) * Number(quantity);

        // insert invoice item
        await db.execute(
            `INSERT INTO invoice_items
            (invoice_id, product_id, quantity, price, total)
            VALUES (?, ?, ?, ?, ?)`,
            [invoice_id, product_id, quantity, selling_price, total]
        );

        // reduce stock
        await db.execute(
            `UPDATE products
             SET stock = stock - ?
             WHERE id = ?`,
            [quantity, product_id]
        );

        // recalc invoice total
        const [totals] = await db.execute(
            `SELECT COALESCE(SUM(total), 0) AS totalAmount
             FROM invoice_items
             WHERE invoice_id = ?`,
            [invoice_id]
        );

        const totalAmount = Number(totals[0].totalAmount);

        // discount
        const [invoiceRows] = await db.execute(
            `SELECT discount FROM invoices WHERE id = ?`,
            [invoice_id]
        );

        const discount = Number(invoiceRows[0]?.discount || 0);

        // update invoice
        await db.execute(
            `UPDATE invoices
             SET total_amount = ?,
                 grand_total = ?
             WHERE id = ?`,
            [totalAmount, totalAmount - discount, invoice_id]
        );

        res.json({
            message: 'Item added successfully',
            total,
            invoice_total: totalAmount,
            grand_total: totalAmount - discount
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};