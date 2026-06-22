const db = require('../config/db');

exports.applyDiscount = async (req, res) => {
    try {
        // ✅ SAFE: get invoice from middleware
        const invoice = req.invoice;

        const invoice_id = invoice.id;

        const { discount_percentage } = req.body;

        if (!discount_percentage) {
            return res.status(400).json({
                message: "Discount percentage required"
            });
        }

        // calculate discount
        const [totals] = await db.execute(
            `SELECT COALESCE(SUM(total), 0) AS totalAmount
             FROM invoice_items
             WHERE invoice_id = ?`,
            [invoice_id]
        );

        const totalAmount = Number(totals[0].totalAmount);

        const discountAmount =
            (totalAmount * Number(discount_percentage)) / 100;

        const grandTotal = totalAmount - discountAmount;

        // update invoice
        await db.execute(
            `UPDATE invoices
             SET discount_percentage = ?,
                 discount_amount = ?,
                 grand_total = ?
             WHERE id = ?`,
            [discount_percentage, discountAmount, grandTotal, invoice_id]
        );

        return res.json({
            message: "Discount applied successfully",
            total_amount: totalAmount,
            discount_amount: discountAmount,
            grand_total: grandTotal
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};