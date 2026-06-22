const db = require('../config/db');


// CREATE INVOICE
exports.createInvoice = async (req, res) => {
    const { user_id, customer_id } = req.body;

    try {
        const invoiceNo = 'INV-' + Date.now();

        const [result] = await db.execute(
            `INSERT INTO invoices (
                invoice_no,
                user_id,
                customer_id
            ) VALUES (?, ?, ?)`,
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

// GET SINGLE INVOICE
exports.getInvoice = async (req, res) => {
    const invoiceId = req.params.id;

    try {
        const [invoiceRows] = await db.execute(
            'SELECT * FROM invoices WHERE id = ?',
            [invoiceId]
        );

        if (invoiceRows.length === 0) {
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
             JOIN products p
                ON ii.product_id = p.id
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

// GET ALL INVOICES
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

exports.finalizeInvoice = async (req, res) => {
    const { id } = req.params;

    try {
        // check invoice exists
        const [rows] = await db.execute(
            `SELECT is_finalized FROM invoices WHERE id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        // already finalized?
        if (rows[0].is_finalized == 1) {
            return res.status(400).json({
                message: "Invoice already finalized"
            });
        }

        // finalize invoice
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

exports.cancelInvoice = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. get invoice
        const [invoiceRows] = await db.execute(
            `SELECT is_finalized, is_cancelled FROM invoices WHERE id = ?`,
            [id]
        );

        if (invoiceRows.length === 0) {
            return res.status(404).json({
                message: "Invoice not found"
            });
        }

        const invoice = invoiceRows[0];

        // 2. already cancelled check
        if (invoice.is_cancelled == 1) {
            return res.status(400).json({
                message: "Invoice already cancelled"
            });
        }

        // 3. get invoice items
        const [items] = await db.execute(
            `SELECT product_id, quantity FROM invoice_items WHERE invoice_id = ?`,
            [id]
        );

        // 4. restore stock
        for (const item of items) {
            await db.execute(
                `UPDATE products 
                 SET stock = stock + ? 
                 WHERE id = ?`,
                [item.quantity, item.product_id]
            );
        }

        // 5. mark invoice cancelled
        await db.execute(
            `UPDATE invoices 
             SET is_cancelled = 1 
             WHERE id = ?`,
            [id]
        );

        res.json({
            message: "Invoice cancelled and stock restored successfully",
            invoice_id: id
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};