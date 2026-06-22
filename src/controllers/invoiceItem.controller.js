const db = require('../config/db');


exports.addItem = async (req, res) => {

    const [inv] = await db.execute(
    `SELECT is_finalized, is_cancelled FROM invoices WHERE id = ?`,
    [invoice_id]
);

if (inv[0]?.is_cancelled == 1) {
    return res.status(400).json({
        message: "Invoice is cancelled. No changes allowed."
    });
}

if (inv[0]?.is_finalized == 1) {
    return res.status(400).json({
        message: "Invoice is finalized. No changes allowed."
    });
}

if (inv[0]?.is_cancelled == 1) {
    return res.status(400).json({
        message: "Invoice is cancelled. No changes allowed."
    });
}
    const { invoice_id, product_id, quantity, selling_price } = req.body;

    try {
        if (!invoice_id || !product_id || !quantity || !selling_price) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // 1. CHECK INVOICE STATUS FIRST (VERY IMPORTANT)
        const [invoiceCheck] = await db.execute(
            `SELECT is_finalized, discount_percentage
             FROM invoices
             WHERE id = ?`,
            [invoice_id]
        );

        if (invoiceCheck.length === 0) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        if (invoiceCheck[0].is_finalized == 1) {
            return res.status(400).json({
                message: "Invoice is finalized. Cannot add items."
            });
        }

        // OPTIONAL RULE (if you want strict system)
        if (invoiceCheck[0].discount_percentage > 0) {
            return res.status(400).json({
                message: "Cannot add items after discount is applied"
            });
        }

        // 2. GET PRODUCT
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

        // 3. STOCK CHECK
        if (product.stock < quantity) {
            return res.status(400).json({
                message: 'Insufficient stock'
            });
        }

        const total = Number(selling_price) * Number(quantity);

        // 4. INSERT ITEM
        await db.execute(
            `INSERT INTO invoice_items
            (invoice_id, product_id, quantity, price, total)
            VALUES (?, ?, ?, ?, ?)`,
            [invoice_id, product_id, quantity, selling_price, total]
        );

        // 5. REDUCE STOCK
        await db.execute(
            `UPDATE products
             SET stock = stock - ?
             WHERE id = ?`,
            [quantity, product_id]
        );

        // 6. RECALCULATE TOTAL
        const [totals] = await db.execute(
            `SELECT COALESCE(SUM(total), 0) AS totalAmount
             FROM invoice_items
             WHERE invoice_id = ?`,
            [invoice_id]
        );

        const totalAmount = Number(totals[0].totalAmount);

        // 7. GET DISCOUNT
        const discountPercentage = Number(invoiceCheck[0].discount_percentage || 0);

        const discountAmount = (totalAmount * discountPercentage) / 100;

        const grandTotal = totalAmount - discountAmount;

        // 8. UPDATE INVOICE
        await db.execute(
            `UPDATE invoices
             SET total_amount = ?,
                 discount_amount = ?,
                 grand_total = ?
             WHERE id = ?`,
            [totalAmount, discountAmount, grandTotal, invoice_id]
        );

        res.json({
            message: 'Item added successfully',
            item_total: total,
            invoice_total: totalAmount,
            discount_amount: discountAmount,
            grand_total: grandTotal
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};