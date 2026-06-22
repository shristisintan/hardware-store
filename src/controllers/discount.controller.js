const db = require('../config/db');


exports.applyDiscount = async (req, res) => {
    const [inv] = await db.execute(
    `SELECT is_finalized, is_cancelled FROM invoices WHERE id = ?`,
    [invoice_id]
);

if (inv[0]?.is_cancelled == 1) {
    return res.status(400).json({
        error: "Invoice is cancelled. Cannot apply discount."
    });
}

if (inv[0]?.is_finalized == 1) {
    return res.status(400).json({
        error: "Invoice is finalized. Cannot apply discount."
    });
}
    const { invoice_id, discount_percentage } = req.body;

    try {
        if (!invoice_id || discount_percentage == null) {
            return res.status(400).json({
                error: 'invoice_id and discount_percentage are required'
            });
        }

        const [rows] = await db.execute(
            `SELECT total_amount, is_finalized
             FROM invoices
             WHERE id = ?`,
            [invoice_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Invoice not found'
            });
        }

        const invoice = rows[0];

        if (invoice.is_finalized == 1) {
            return res.status(400).json({
                error: 'Invoice is finalized and cannot be modified'
            });
        }

        const totalAmount = Number(invoice.total_amount || 0);

        const discountAmount =
            (totalAmount * Number(discount_percentage)) / 100;

        const grandTotal = totalAmount - discountAmount;

        if (invoice.is_cancelled == 1) {
    return res.status(400).json({
        error: "Invoice is cancelled. Cannot apply discount."
    });
}

        await db.execute(
            `UPDATE invoices
             SET discount_percentage = ?,
                 discount_amount = ?,
                 grand_total = ?
             WHERE id = ?`,
            [
                discount_percentage,
                discountAmount,
                grandTotal,
                invoice_id
            ]
        );

        res.json({
            message: 'Discount applied successfully',
            invoice_id,
            total_amount: totalAmount,
            discount_percentage,
            discount_amount: discountAmount,
            grand_total: grandTotal
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};