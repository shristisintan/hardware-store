const db = require('../config/db');

// CREATE INVOICE (bill header)
exports.createInvoice = async (req, res) => {
    const { user_id, customer_id } = req.body;

    try {
        const invoiceNo = 'INV-' + Date.now();

        const [result] = await db.execute(
            `INSERT INTO invoices (invoice_no, user_id, customer_id)
             VALUES (?, ?, ?)`,
            [invoiceNo, user_id, customer_id || null]
        );

        res.json({
            message: 'Invoice created',
            invoice_id: result.insertId,
            invoice_no: invoiceNo
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getInvoice = async (req, res) => {
    const invoiceId = req.params.id;

    try {
        // get invoice
        const [invoice] = await db.execute(
            'SELECT * FROM invoices WHERE id = ?',
            [invoiceId]
        );

        if (invoice.length === 0) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // get items (empty for now, we will use later)
        const [items] = await db.execute(
            'SELECT * FROM invoice_items WHERE invoice_id = ?',
            [invoiceId]
        );

        res.json({
            invoice: invoice[0],
            items: items
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM invoices ORDER BY id DESC'
        );

        res.json(rows);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};