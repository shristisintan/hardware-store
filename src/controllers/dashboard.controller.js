const db = require('../config/db');

// 1. Total sales today
exports.getTodaySales = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT COALESCE(SUM(grand_total), 0) AS totalSales
             FROM invoices
             WHERE DATE(created_at) = CURDATE()
             AND is_cancelled = 0`
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Total invoices today
exports.getTodayInvoices = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT COUNT(*) AS totalInvoices
             FROM invoices
             WHERE DATE(created_at) = CURDATE()`
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Total stock value
exports.getStockValue = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT COALESCE(SUM(stock * purchase_price), 0) AS stockValue
             FROM products`
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Top selling products
exports.getTopProducts = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT 
                p.name,
                SUM(ii.quantity) AS totalSold
             FROM invoice_items ii
             JOIN products p ON p.id = ii.product_id
             GROUP BY ii.product_id, p.name
             ORDER BY totalSold DESC
             LIMIT 5`
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};