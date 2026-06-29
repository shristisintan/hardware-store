const db = require('../config/db');

const getPaymentFields = (grandTotal, paidAmount) => {
    const total = Number(grandTotal || 0);
    const paid = Number(paidAmount || 0);
    const due = Math.max(total - paid, 0);

    let status = "CREDIT";

    if (paid === 0) status = "CREDIT";
    else if (paid < total) status = "PARTIAL";
    else status = "PAID";

    return { paid, due, status };
};

// ===============================
// CREATE INVOICE
// ===============================
exports.createInvoice = async (req, res) => {
    const { customer_id } = req.body;
    const user_id = req.user.id;

    try {
        const invoiceNo = 'INV-' + Date.now();

        const [result] = await db.execute(
            `INSERT INTO invoices (
                invoice_no,
                user_id,
                customer_id,
                total_amount,
                grand_total,
                paid_amount,
                due_amount,
                payment_status
            ) VALUES (?, ?, ?, 0, 0, 0, 0, 'CREDIT')`,
            [invoiceNo, user_id, customer_id || null]
        );

        res.json({
            message: 'Invoice created',
            invoice_id: result.insertId,
            invoice_no: invoiceNo
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};


// ===============================
// GET SINGLE INVOICE
// ===============================
exports.getInvoice = async (req, res) => {
    const invoiceId = req.params.id;

    try {
        const [invoiceRows] = await db.execute(
            `SELECT
                i.*,
                c.name AS customer_name,
                c.phone AS customer_phone,
                c.address AS customer_address,
                u.name AS prepared_by
             FROM invoices i
             LEFT JOIN customers c ON i.customer_id = c.id
             LEFT JOIN users u ON i.user_id = u.id
             WHERE i.id = ?`,
            [invoiceId]
        );

        if (!invoiceRows.length) {
            return res.status(404).json({
                message: 'Invoice not found'
            });
        }

        const invoice = invoiceRows[0];

        const [items] = await db.execute(
            `SELECT
                ii.id,
                ii.product_id,
                p.name,
                ii.quantity,
                ii.price,
                ii.total
             FROM invoice_items ii
             JOIN products p ON ii.product_id = p.id
             WHERE ii.invoice_id = ?`,
            [invoiceId]
        );

        res.json({
            invoice,
            items
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};


// ===============================
// GET ALL INVOICES
// ===============================
exports.getAllInvoices = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM invoices ORDER BY id DESC'
        );

        res.json(rows);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};


// ===============================
// FINALIZE INVOICE
// ===============================
exports.finalizeInvoice = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute(
            `SELECT is_finalized, is_cancelled FROM invoices WHERE id = ?`,
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        if (rows[0].is_finalized == 1) {
            return res.status(400).json({
                message: "Invoice already finalized"
            });
        }

        if (rows[0].is_cancelled == 1) {
            return res.status(400).json({
                message: "Cancelled invoice cannot be finalized"
            });
        }

        await db.execute(
            `UPDATE invoices
             SET is_finalized = 1
             WHERE id = ?`,
            [id]
        );

        res.json({
            message: "Invoice finalized successfully",
            invoice_id: id
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};


// ===============================
// UPDATE PAYMENT (CORE LOGIC)
// ===============================
exports.updatePayment = async (req, res) => {
    const { id } = req.params;
    const { paid_amount } = req.body;

    try {
        const [rows] = await db.execute(
            `SELECT grand_total, is_cancelled FROM invoices WHERE id = ?`,
            [id]
        );

        if (!rows.length) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        if (rows[0].is_cancelled == 1) {
            return res.status(400).json({
                message: "Cannot update payment for cancelled invoice"
            });
        }

        const grandTotal = Number(rows[0].grand_total || 0);
        const paid = Number(paid_amount);

        if (paid_amount == null || paid_amount === '') {
            return res.status(400).json({
                message: "Paid amount is required"
            });
        }

        if (Number.isNaN(paid)) {
            return res.status(400).json({
                message: "Paid amount must be a number"
            });
        }

        if (paid < 0) {
            return res.status(400).json({
                message: "Paid amount cannot be negative"
            });
        }

        if (paid > grandTotal) {
            return res.status(400).json({
                message: "Paid amount cannot exceed total"
            });
        }

        const payment = getPaymentFields(grandTotal, paid);

        await db.execute(
            `UPDATE invoices
             SET paid_amount = ?,
                 due_amount = ?,
                 payment_status = ?
             WHERE id = ?`,
            [payment.paid, payment.due, payment.status, id]
        );

        res.json({
            message: "Payment updated successfully",
            invoice_id: id,
            paid_amount: payment.paid,
            due_amount: payment.due,
            payment_status: payment.status
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};


// ===============================
// CANCEL INVOICE + RESTORE STOCK
// ===============================
exports.cancelInvoice = async (req, res) => {
    const { id } = req.params;
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [invoiceRows] = await connection.execute(
            `SELECT is_cancelled FROM invoices WHERE id = ?`,
            [id]
        );

        if (!invoiceRows.length) {
            await connection.rollback();
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        if (invoiceRows[0].is_cancelled == 1) {
            await connection.rollback();
            return res.status(400).json({
                message: "Invoice already cancelled"
            });
        }

        const [items] = await connection.execute(
            `SELECT product_id, quantity FROM invoice_items WHERE invoice_id = ?`,
            [id]
        );

        for (const item of items) {
            await connection.execute(
                `UPDATE products
                 SET stock = stock + ?
                 WHERE id = ?`,
                [item.quantity, item.product_id]
            );
        }

        await connection.execute(
            `UPDATE invoices
             SET is_cancelled = 1
             WHERE id = ?`,
            [id]
        );

        await connection.commit();

        res.json({
            message: "Invoice cancelled and stock restored successfully",
            invoice_id: id
        });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({
            error: err.message
        });
    } finally {
        connection.release();
    }
};
