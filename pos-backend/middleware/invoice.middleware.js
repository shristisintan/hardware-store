const db = require('../config/db');

// CHECK INVOICE EXISTS
exports.checkInvoiceExists = async (req, res, next) => {
    try {
        const invoiceId = req.params.id || req.body.invoice_id;

        const [rows] = await db.execute(
            `SELECT * FROM invoices WHERE id = ?`,
            [invoiceId]
        );

        if (!rows.length) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        req.invoice = rows[0]; // attach invoice
        next();

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// CHECK INVOICE NOT LOCKED
exports.checkInvoiceNotLocked = async (req, res, next) => {
    try {
        const invoice = req.invoice;

        if (!invoice) {
            return res.status(400).json({
                message: "Invoice not loaded"
            });
        }

        // ✅ SINGLE CLEAN CHECK (CORRECT WAY)
        if (invoice.is_finalized == 1 || invoice.is_cancelled == 1) {
            return res.status(400).json({
                message: "Invoice is locked"
            });
        }

        next();

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};