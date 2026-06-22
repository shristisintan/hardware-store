const db = require('../config/db');

// CREATE CUSTOMER
exports.createCustomer = async (req, res) => {
    const { name, phone, address } = req.body;

    try {
        const [result] = await db.execute(
            `INSERT INTO customers (name, phone, address)
             VALUES (?, ?, ?)`,
            [name, phone, address]
        );

        res.json({
            message: 'Customer created successfully',
            customer_id: result.insertId
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

// GET ALL CUSTOMERS
exports.getAllCustomers = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT * FROM customers
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
            `SELECT * FROM customers
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