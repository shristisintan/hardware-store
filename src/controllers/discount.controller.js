const db = require('../config/db');

exports.applyDiscount = async (req, res) => {
    try {
        // ✅ SAFE: get invoice from middleware
        const invoice = req.invoice;

        const invoice_id = invoice.id;

        const { discount_percentage } = req.body;
        const discountPercentage = Number(discount_percentage);

        if (discount_percentage == null || discount_percentage === '') {
            return res.status(400).json({
                message: "Discount percentage required"
            });
        }

        if (Number.isNaN(discountPercentage)) {
            return res.status(400).json({
                message: "Discount percentage must be a number"
            });
        }

        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({
                message: "Discount percentage must be between 0 and 100"
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
            (totalAmount * discountPercentage) / 100;

        const grandTotal = totalAmount - discountAmount;
        const paidAmount = Math.min(Number(invoice.paid_amount || 0), grandTotal);
        const dueAmount = Math.max(grandTotal - paidAmount, 0);
        let paymentStatus = "CREDIT";

        if (paidAmount === 0) paymentStatus = "CREDIT";
        else if (paidAmount < grandTotal) paymentStatus = "PARTIAL";
        else paymentStatus = "PAID";

        // update invoice
        await db.execute(
            `UPDATE invoices
             SET discount_percentage = ?,
                 discount_amount = ?,
                 grand_total = ?,
                 paid_amount = ?,
                 due_amount = ?,
                 payment_status = ?
             WHERE id = ?`,
            [
                discountPercentage,
                discountAmount,
                grandTotal,
                paidAmount,
                dueAmount,
                paymentStatus,
                invoice_id
            ]
        );

        return res.json({
            message: "Discount applied successfully",
            total_amount: totalAmount,
            discount_amount: discountAmount,
            grand_total: grandTotal,
            paid_amount: paidAmount,
            due_amount: dueAmount,
            payment_status: paymentStatus
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};
