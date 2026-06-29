const db = require('../config/db');

// 💰 TOTAL PROFIT (ALL TIME)
exports.totalProfit = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT COALESCE(SUM(
                (ii.price - p.purchase_price) * ii.quantity
            ), 0) AS total_profit
            FROM invoice_items ii
            JOIN products p ON p.id = ii.product_id
            JOIN invoices i ON i.id = ii.invoice_id
            WHERE i.is_cancelled = 0`
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📄 PROFIT PER INVOICE
exports.profitPerInvoice = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await db.execute(
            `SELECT COALESCE(SUM(
                (ii.price - p.purchase_price) * ii.quantity
            ), 0) AS invoice_profit
            FROM invoice_items ii
            JOIN products p ON p.id = ii.product_id
            JOIN invoices i ON i.id = ii.invoice_id
            WHERE ii.invoice_id = ?
            AND i.is_cancelled = 0`,
            [id]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 🏆 TOP PROFIT PRODUCTS
exports.topProfitProducts = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT 
                p.name,
                SUM((ii.price - p.purchase_price) * ii.quantity) AS profit
            FROM invoice_items ii
            JOIN products p ON p.id = ii.product_id
            JOIN invoices i ON i.id = ii.invoice_id
            WHERE i.is_cancelled = 0
            GROUP BY ii.product_id, p.name
            ORDER BY profit DESC
            LIMIT 5`
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 📅 TODAY PROFIT
exports.todayProfit = async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT COALESCE(SUM(
                (ii.price - p.purchase_price) * ii.quantity
            ), 0) AS today_profit
            FROM invoice_items ii
            JOIN invoices i ON i.id = ii.invoice_id
            JOIN products p ON p.id = ii.product_id
            WHERE DATE(i.created_at) = CURDATE()
            AND i.is_cancelled = 0`
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
