// services/invoiceCalculator.service.js

// ======================================
// PAYMENT STATUS
// ======================================
const getPaymentStatus = (
    grandTotal,
    paidAmount
) => {

    grandTotal = Number(grandTotal || 0);
    paidAmount = Number(paidAmount || 0);

    if (paidAmount <= 0)
        return "CREDIT";

    if (paidAmount < grandTotal)
        return "PARTIAL";

    return "PAID";

};

// ======================================
// CALCULATE TOTALS
// ======================================
const calculateTotals = (
    subtotal,
    discount,
    paid
) => {

    subtotal = Number(subtotal || 0);
    discount = Number(discount || 0);
    paid = Number(paid || 0);

    if (discount > subtotal) {
        discount = subtotal;
    }

    const grandTotal =
        subtotal - discount;

    const dueAmount =
        Math.max(grandTotal - paid, 0);

    return {

        totalAmount: subtotal,

        discount,

        grandTotal,

        dueAmount,

        paymentStatus:
            getPaymentStatus(
                grandTotal,
                paid
            ),

    };

};

// ======================================
// RECALCULATE INVOICE
// ======================================
const recalculateInvoice =
    async (connection, invoiceId) => {

        const [invoiceRows] =
            await connection.execute(

                `SELECT
                    discount_amount,
                    paid_amount
                 FROM invoices
                 WHERE id=?`,

                [invoiceId]

            );

        if (!invoiceRows.length) {
            throw new Error(
                "Invoice not found."
            );
        }

        const invoice =
            invoiceRows[0];

        const [totals] =
            await connection.execute(

                `SELECT
                    COALESCE(
                        SUM(total),
                        0
                    ) AS subtotal
                 FROM invoice_items
                 WHERE invoice_id=?`,

                [invoiceId]

            );

        const result =
            calculateTotals(

                totals[0].subtotal,

                invoice.discount_amount,

                invoice.paid_amount

            );

        await connection.execute(

            `UPDATE invoices
             SET
                total_amount=?,
                grand_total=?,
                due_amount=?,
                payment_status=?
             WHERE id=?`,

            [

                result.totalAmount,

                result.grandTotal,

                result.dueAmount,

                result.paymentStatus,

                invoiceId,

            ]

        );

        return result;

};

module.exports = {

    calculateTotals,

    getPaymentStatus,

    recalculateInvoice,

};