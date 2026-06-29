const db = require('../config/db');

// ===============================
// FULL DASHBOARD API
// ===============================
exports.getDashboard = async (req, res) => {
    try {

        // =========================
        // 1. TODAY SALES
        // =========================
        const [sales] = await db.execute(
            `SELECT COALESCE(SUM(grand_total), 0) AS totalSales
             FROM invoices
             WHERE created_at >= CURDATE()
             AND created_at < CURDATE() + INTERVAL 1 DAY
             AND is_cancelled = 0`
        );

        // =========================
        // 2. TODAY INVOICES
        // =========================
        const [invoices] = await db.execute(
            `SELECT COUNT(*) AS totalInvoices
             FROM invoices
             WHERE created_at >= CURDATE()
             AND created_at < CURDATE() + INTERVAL 1 DAY
             AND is_cancelled = 0`
        );

        // =========================
        // 3. STOCK VALUE
        // =========================
        const [stockValue] = await db.execute(
            `SELECT COALESCE(SUM(stock * purchase_price), 0) AS stockValue
             FROM products`
        );

        // =========================
        // 4. TOP PRODUCTS
        // =========================
        const [topProducts] = await db.execute(
            `SELECT 
                p.id,
                p.name,
                SUM(ii.quantity) AS totalSold
             FROM invoice_items ii
             JOIN products p ON p.id = ii.product_id
             JOIN invoices i ON i.id = ii.invoice_id
             WHERE i.is_cancelled = 0
             GROUP BY ii.product_id, p.id, p.name
             ORDER BY totalSold DESC
             LIMIT 5`
        );

        // =========================
        // 5. LOW STOCK ALERTS
        // =========================
        const [lowStock] = await db.execute(
            `SELECT 
                id AS product_id,
                name,
                stock,
                COALESCE(low_stock_limit, 5) AS low_stock_limit,
                CASE 
                    WHEN stock = 0 THEN 'OUT_OF_STOCK'
                    WHEN stock <= 2 THEN 'CRITICAL'
                    ELSE 'LOW'
                END AS status
             FROM products
             WHERE stock <= COALESCE(low_stock_limit, 5)
             ORDER BY stock ASC`
        );

        // =========================
        // RESPONSE
        // =========================
        res.json({
            today_sales: sales[0].totalSales,
            today_invoices: invoices[0].totalInvoices,
            stock_value: stockValue[0].stockValue,
            top_products: topProducts,
            low_stock_alerts: {
                total_alerts: lowStock.length,
                items: lowStock
            }
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
