const db = require('../config/db');

exports.addItem = async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        let { invoice_id, product_id, quantity, selling_price } = req.body;

        // =========================
        // 1. VALIDATION
        // =========================
        if (!invoice_id || !product_id || !quantity || !selling_price) {
            await connection.rollback();
            return res.status(400).json({
                message: "invoice_id, product_id, quantity, selling_price are required"
            });
        }

        quantity = Number(quantity);
        selling_price = Number(selling_price);

        if (Number.isNaN(quantity) || Number.isNaN(selling_price)) {
            await connection.rollback();
            return res.status(400).json({
                message: "Quantity and selling price must be numbers"
            });
        }

        if (quantity <= 0) {
            await connection.rollback();
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });
        }

        if (selling_price <= 0) {
            await connection.rollback();
            return res.status(400).json({
                message: "Selling price must be greater than 0"
            });
        }

        // =========================
        // 2. CHECK INVOICE
        // =========================
        const [invoiceRows] = await connection.execute(
            `SELECT is_finalized, is_cancelled, discount_amount, paid_amount
             FROM invoices
             WHERE id = ?`,
            [invoice_id]
        );

        if (!invoiceRows.length) {
            await connection.rollback();
            return res.status(404).json({ message: "Invoice not found" });
        }

        const invoice = invoiceRows[0];

        if (invoice.is_finalized || invoice.is_cancelled) {
            await connection.rollback();
            return res.status(400).json({
                message: "Invoice is locked"
            });
        }

        // =========================
        // 3. CHECK PRODUCT + STOCK
        // =========================
        const [productRows] = await connection.execute(
            `SELECT id, stock, name
             FROM products
             WHERE id = ?`,
            [product_id]
        );

        if (!productRows.length) {
            await connection.rollback();
            return res.status(404).json({ message: "Product not found" });
        }

        const product = productRows[0];

        // =========================
        // 4. SAFE STOCK DEDUCTION (IMPORTANT FIX)
        // =========================
        const [stockUpdate] = await connection.execute(
            `UPDATE products
             SET stock = stock - ?
             WHERE id = ? AND stock >= ?`,
            [quantity, product_id, quantity]
        );

        if (stockUpdate.affectedRows === 0) {
            await connection.rollback();
            return res.status(400).json({
                message: `Insufficient stock for ${product.name}`
            });
        }

        // =========================
        // 5. INSERT ITEM
        // =========================
        const total = quantity * selling_price;

        await connection.execute(
            `INSERT INTO invoice_items
             (invoice_id, product_id, quantity, price, total)
             VALUES (?, ?, ?, ?, ?)`,
            [invoice_id, product_id, quantity, selling_price, total]
        );

        // =========================
        // 6. RECALCULATE TOTAL
        // =========================
        const [totals] = await connection.execute(
            `SELECT COALESCE(SUM(total), 0) AS totalAmount
             FROM invoice_items
             WHERE invoice_id = ?`,
            [invoice_id]
        );

        const totalAmount = Number(totals[0].totalAmount);
        const discount = Number(invoice.discount_amount || 0);
        const paid = Number(invoice.paid_amount || 0);

        if (discount > totalAmount) {
            await connection.rollback();
            return res.status(400).json({
                message: "Invalid discount greater than total"
            });
        }

        const grandTotal = totalAmount - discount;
        const dueAmount = Math.max(grandTotal - paid, 0);
        let paymentStatus = "CREDIT";

        if (paid === 0) paymentStatus = "CREDIT";
        else if (paid < grandTotal) paymentStatus = "PARTIAL";
        else paymentStatus = "PAID";

        // =========================
        // 7. UPDATE INVOICE
        // =========================
        await connection.execute(
            `UPDATE invoices
             SET total_amount = ?,
                 grand_total = ?,
                 due_amount = ?,
                 payment_status = ?
             WHERE id = ?`,
            [totalAmount, grandTotal, dueAmount, paymentStatus, invoice_id]
        );

        // =========================
        // 8. COMMIT
        // =========================
        await connection.commit();

        return res.json({
            message: "Item added successfully",
            item_total: total,
            invoice_total: totalAmount,
            grand_total: grandTotal,
            due_amount: dueAmount,
            payment_status: paymentStatus
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
