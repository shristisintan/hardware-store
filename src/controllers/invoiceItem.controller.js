const db = require('../config/db');

exports.addItem = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { invoice_id, product_id, quantity, selling_price } = req.body;

        // -------------------------
        // 1. VALIDATION
        // -------------------------
        if (!invoice_id || !product_id || !quantity || !selling_price) {
            await connection.rollback();
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // -------------------------
        // 2. CHECK INVOICE STATUS
        // -------------------------
        const [invoiceRows] = await connection.execute(
            `SELECT is_finalized, is_cancelled, discount_amount
             FROM invoices
             WHERE id = ?`,
            [invoice_id]
        );

        if (!invoiceRows.length) {
            await connection.rollback();
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        const invoice = invoiceRows[0];

        if (invoice.is_finalized == 1 || invoice.is_cancelled == 1) {
            await connection.rollback();
            return res.status(400).json({
                message: "Invoice is locked (finalized/cancelled)"
            });
        }

        // -------------------------
        // 3. GET PRODUCT
        // -------------------------
        const [productRows] = await connection.execute(
            `SELECT * FROM products WHERE id = ?`,
            [product_id]
        );

        if (!productRows.length) {
            await connection.rollback();
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const product = productRows[0];

        // -------------------------
        // 4. STOCK CHECK
        // -------------------------
        const qty = Number(quantity);

        if (product.stock < qty) {
            await connection.rollback();
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        const price = Number(selling_price);
        const total = price * qty;

        // -------------------------
        // 5. INSERT ITEM
        // -------------------------
        await connection.execute(
            `INSERT INTO invoice_items
             (invoice_id, product_id, quantity, price, total)
             VALUES (?, ?, ?, ?, ?)`,
            [invoice_id, product_id, qty, price, total]
        );

        // -------------------------
        // 6. UPDATE STOCK
        // -------------------------
        await connection.execute(
            `UPDATE products
             SET stock = stock - ?
             WHERE id = ?`,
            [qty, product_id]
        );

        // -------------------------
        // 7. RECALCULATE TOTAL
        // -------------------------
        const [totals] = await connection.execute(
            `SELECT COALESCE(SUM(total), 0) AS totalAmount
             FROM invoice_items
             WHERE invoice_id = ?`,
            [invoice_id]
        );

        const totalAmount = Number(totals[0].totalAmount);

        const discountAmount = Number(invoice.discount_amount || 0);

        const grandTotal = totalAmount - discountAmount;

        // -------------------------
        // 8. UPDATE INVOICE
        // -------------------------
        await connection.execute(
            `UPDATE invoices
             SET total_amount = ?,
                 grand_total = ?
             WHERE id = ?`,
            [totalAmount, grandTotal, invoice_id]
        );

        // -------------------------
        // 9. COMMIT
        // -------------------------
        await connection.commit();

        return res.json({
            message: "Item added successfully",
            item_total: total,
            invoice_total: totalAmount,
            discount_amount: discountAmount,
            grand_total: grandTotal
        });

    } catch (err) {
        await connection.rollback();
        return res.status(500).json({
            error: err.message
        });
    } finally {
        connection.release();
    }
};