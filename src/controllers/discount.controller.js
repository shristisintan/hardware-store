const db = require('../config/db');

exports.applyDiscount = async (req, res) => {
    const { invoice_id, discount } = req.body;

    try {
        const [rows] = await db.execute(
            'SELECT total_amount FROM invoices WHERE id = ?',
            [invoice_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: 'Invoice not found'
            });
        }

        const totalAmount = Number(rows[0].total_amount);
        const grandTotal = totalAmount - Number(discount);

        await db.execute(
            `UPDATE invoices
             SET discount = ?,
                 grand_total = ?
             WHERE id = ?`,
            [discount, grandTotal, invoice_id]
        );

        res.json({
            message: 'Discount applied',
            grand_total: grandTotal
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};