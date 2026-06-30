const db = require('../config/db');

// ===============================
// DASHBOARD API
// ===============================
exports.getDashboard = async (req, res) => {
    try {

        // =========================
        // 1. TODAY SALES
        // =========================
        const [sales] = await db.execute(`
            SELECT COALESCE(SUM(grand_total), 0) AS totalSales
            FROM invoices
            WHERE created_at >= CURDATE()
              AND created_at < CURDATE() + INTERVAL 1 DAY
              AND is_cancelled = 0
        `);

        // =========================
        // 2. TODAY INVOICES
        // =========================
        const [invoices] = await db.execute(`
            SELECT COUNT(*) AS totalInvoices
            FROM invoices
            WHERE created_at >= CURDATE()
              AND created_at < CURDATE() + INTERVAL 1 DAY
              AND is_cancelled = 0
        `);

        // =========================
        // 3. TOTAL PRODUCTS
        // =========================
        const [products] = await db.execute(`
            SELECT COUNT(*) AS totalProducts
            FROM products
        `);

        // =========================
        // 4. TOTAL CUSTOMERS
        // =========================
        const [customers] = await db.execute(`
            SELECT COUNT(*) AS totalCustomers
            FROM customers
        `);

        // =========================
        // 5. STOCK VALUE
        // =========================
        const [stockValue] = await db.execute(`
            SELECT COALESCE(SUM(stock * purchase_price), 0) AS stockValue
            FROM products
        `);

        // =========================
        // 6. TOP SELLING PRODUCTS
        // =========================
        const [topProducts] = await db.execute(`
            SELECT
                p.id,
                p.name,
                SUM(ii.quantity) AS totalSold
            FROM invoice_items ii
            JOIN products p
                ON p.id = ii.product_id
            JOIN invoices i
                ON i.id = ii.invoice_id
            WHERE i.is_cancelled = 0
            GROUP BY p.id, p.name
            ORDER BY totalSold DESC
            LIMIT 5
        `);

        // =========================
        // 7. RECENT TRANSACTIONS
        // =========================
        // =========================
// 7. RECENT TRANSACTIONS
// =========================
const [recentTransactions] = await db.execute(`
    SELECT
        i.id,
        i.invoice_no,
        COALESCE(c.name, 'Walk-in Customer') AS customer_name,
        i.grand_total,
        i.payment_status,
        i.created_at
    FROM invoices i
    LEFT JOIN customers c
        ON c.id = i.customer_id
    WHERE i.is_cancelled = 0
    ORDER BY i.created_at DESC
    LIMIT 5
`);

        // =========================
        // 8. LOW STOCK ALERTS
        // =========================
        const [lowStock] = await db.execute(`
            SELECT
                id AS product_id,
                name,
                stock,
                low_stock_limit,
                CASE
                    WHEN stock = 0 THEN 'OUT_OF_STOCK'
                    WHEN stock <= 2 THEN 'CRITICAL'
                    ELSE 'LOW'
                END AS status
            FROM products
            WHERE stock <= low_stock_limit
            ORDER BY stock ASC
        `);

        // =========================
        // RESPONSE
        // =========================
        res.status(200).json({
            summary: {
                today_sales: Number(sales[0].totalSales),
                today_invoices: Number(invoices[0].totalInvoices),
                total_products: Number(products[0].totalProducts),
                total_customers: Number(customers[0].totalCustomers),
                stock_value: Number(stockValue[0].stockValue),
                low_stock_count: lowStock.length
            },

            top_products: topProducts.map(product => ({
                ...product,
                totalSold: Number(product.totalSold)
            })),

            recent_transactions: recentTransactions.map(transaction => ({
                ...transaction,
                grand_total: Number(transaction.grand_total)
            })),

            low_stock_alerts: lowStock
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard data.',
            error: err.message
        });
    }
};