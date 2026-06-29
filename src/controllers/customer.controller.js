const db = require('../config/db');

// CREATE CUSTOMER
exports.createCustomer = async (req, res) => {
let { name, phone, address } = req.body;
try {
    if (!name || !phone) {
        return res.status(400).json({
            message: 'Name and phone are required'
        });
    }

    if (typeof name !== 'string' || typeof phone !== 'string') {
        return res.status(400).json({
            message: 'Name and phone must be text'
        });
    }

    name = name.trim();
    phone = phone.trim();
    address = typeof address === 'string' ? address.trim() : null;

    if (!name || !phone) {
        return res.status(400).json({
            message: 'Name and phone cannot be empty'
        });
    }

    const [result] = await db.execute(
        `INSERT INTO customers (name, phone, address)
         VALUES (?, ?, ?)`,
        [name, phone, address || null]
    );

    res.status(201).json({
        message: 'Customer created successfully',
        customer_id: result.insertId
    });

} catch (err) {
    res.status(500).json({
        error: err.message
    });
}

};


exports.getAllCustomers = async (req, res) => {
try {
const [rows] = await db.execute(
`SELECT *
             FROM customers
             ORDER BY id DESC`
);
    res.json(rows);

} catch (err) {
    res.status(500).json({
        error: err.message
    });
}

};

// GET SINGLE CUSTOMER
exports.getCustomer = async (req, res) => {
try {
const [rows] = await db.execute(
`SELECT *
             FROM customers
             WHERE id = ?`,
[req.params.id]
);


    if (!rows.length) {
        return res.status(404).json({
            message: 'Customer not found'
        });
    }

    res.json(rows[0]);

} catch (err) {
    res.status(500).json({
        error: err.message
    });
}


};

// UPDATE CUSTOMER
exports.updateCustomer = async (req, res) => {
let { name, phone, address } = req.body;


try {
    const [customer] = await db.execute(
        `SELECT id
         FROM customers
         WHERE id = ?`,
        [req.params.id]
    );

    if (!customer.length) {
        return res.status(404).json({
            message: 'Customer not found'
        });
    }

    if (!name || !phone) {
        return res.status(400).json({
            message: 'Name and phone are required'
        });
    }

    if (typeof name !== 'string' || typeof phone !== 'string') {
        return res.status(400).json({
            message: 'Name and phone must be text'
        });
    }

    name = name.trim();
    phone = phone.trim();
    address = typeof address === 'string' ? address.trim() : null;

    if (!name || !phone) {
        return res.status(400).json({
            message: 'Name and phone cannot be empty'
        });
    }

    await db.execute(
        `UPDATE customers
         SET name = ?, phone = ?, address = ?
         WHERE id = ?`,
        [name, phone, address || null, req.params.id]
    );

    res.json({
        message: 'Customer updated successfully'
    });

} catch (err) {
    res.status(500).json({
        error: err.message
    });
}


};

// customer search
exports.searchCustomers = async (req, res) => {
    const keyword = typeof req.query.keyword === 'string'
        ? req.query.keyword.trim()
        : '';

    try {
        if (!keyword) {
            return res.json([]);
        }

        const [rows] = await db.execute(
            `SELECT *
             FROM customers
             WHERE name LIKE ?
             OR phone LIKE ?
             OR alternate_phone LIKE ?
             ORDER BY name ASC`,
            [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
        );

        res.json(rows);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// customer purchase history
exports.getCustomerHistory = async (req, res) => {
    const { id } = req.params;

    try {
        const [customerRows] = await db.execute(
            `SELECT *
             FROM customers
             WHERE id = ?`,
            [id]
        );

        if (!customerRows.length) {
            return res.status(404).json({
                message: 'Customer not found'
            });
        }

        const customer = customerRows[0];

        const [invoices] = await db.execute(
            `SELECT
                id,
                invoice_no,
                total_amount,
                discount_amount,
                grand_total,
                is_finalized,
                is_cancelled,
                created_at
             FROM invoices
             WHERE customer_id = ?
             ORDER BY created_at DESC`,
            [id]
        );

        const totalPurchases = invoices.reduce(
            (sum, inv) => inv.is_cancelled ? sum : sum + Number(inv.grand_total || 0),
            0
        );

        res.json({
            customer,
            summary: {
                total_invoices: invoices.length,
                active_invoices: invoices.filter((inv) => !inv.is_cancelled).length,
                total_purchases: totalPurchases
            },
            invoices
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
try {
const [customer] = await db.execute(
`SELECT id
             FROM customers
             WHERE id = ?`,
[req.params.id]
);


    if (!customer.length) {
        return res.status(404).json({
            message: 'Customer not found'
        });
    }

    await db.execute(
        `DELETE FROM customers
         WHERE id = ?`,
        [req.params.id]
    );

    res.json({
        message: 'Customer deleted successfully'
    });

} catch (err) {
    res.status(500).json({
        error: err.message
    });
}


};

// CUSTOMER DUE SUMMARY (for future ledger/payment system)
exports.getCustomerDueSummary = async (req, res) => {
try {
const [rows] = await db.execute(
`SELECT
                c.id,
                c.name,
                c.phone,
                COALESCE(SUM(CASE WHEN i.is_cancelled = 0 THEN i.grand_total ELSE 0 END), 0) AS total_sales,
                COALESCE(SUM(CASE WHEN i.is_cancelled = 0 THEN i.due_amount ELSE 0 END), 0) AS total_due
             FROM customers c
             LEFT JOIN invoices i
                ON c.id = i.customer_id
             WHERE c.id = ?
             GROUP BY c.id`,
[req.params.id]
);

    if (!rows.length) {
        return res.status(404).json({
            message: 'Customer not found'
        });
    }

    res.json(rows[0]);

} catch (err) {
    res.status(500).json({
        error: err.message
    });
}

};
