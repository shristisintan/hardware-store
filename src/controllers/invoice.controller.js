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