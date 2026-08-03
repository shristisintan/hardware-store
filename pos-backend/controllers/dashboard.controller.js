const db = require("../config/db");

// =====================================================
// DASHBOARD
// =====================================================
exports.getDashboard = async (req, res) => {
  try {
    // ===================================================
    // 1. TODAY'S SALES
    // ===================================================
    const [sales] = await db.execute(`
      SELECT
        COALESCE(SUM(grand_total), 0) AS totalSales
      FROM invoices
      WHERE created_at >= CURDATE()
        AND created_at < CURDATE() + INTERVAL 1 DAY
        AND is_cancelled = 0
    `);

    // ===================================================
    // 2. TODAY'S INVOICES
    // ===================================================
    const [invoices] = await db.execute(`
      SELECT
        COUNT(*) AS totalInvoices
      FROM invoices
      WHERE created_at >= CURDATE()
        AND created_at < CURDATE() + INTERVAL 1 DAY
        AND is_cancelled = 0
    `);

    // ===================================================
    // 3. TOTAL PRODUCTS
    // ===================================================
    const [products] = await db.execute(`
      SELECT
        COUNT(*) AS totalProducts
      FROM products
    `);

    // ===================================================
    // 4. TOTAL CUSTOMERS
    // ===================================================
    const [customers] = await db.execute(`
      SELECT
        COUNT(*) AS totalCustomers
      FROM customers
    `);

    // ===================================================
    // 5. STOCK VALUE
    // ===================================================
    const [stockValue] = await db.execute(`
      SELECT
        COALESCE(
          SUM(stock * purchase_price),
          0
        ) AS stockValue
      FROM products
    `);

    // ===================================================
    // 6. STOCK STATUS
    //
    // SAME RULE AS ProductTable.jsx
    //
    // Critical:
    // stock <= low_stock_limit
    //
    // Low:
    // stock > low_stock_limit
    // AND stock <= low_stock_threshold
    //
    // In Stock:
    // stock > low_stock_threshold
    // ===================================================
    const [stockStatus] = await db.execute(`
      SELECT
        COUNT(*) AS totalProducts,

        SUM(
          CASE
            WHEN stock <= COALESCE(low_stock_limit, 5)
            THEN 1
            ELSE 0
          END
        ) AS criticalCount,

        SUM(
          CASE
            WHEN stock > COALESCE(low_stock_limit, 5)
             AND stock <= COALESCE(low_stock_threshold, 10)
            THEN 1
            ELSE 0
          END
        ) AS lowStockCount,

        SUM(
          CASE
            WHEN stock > COALESCE(low_stock_threshold, 10)
            THEN 1
            ELSE 0
          END
        ) AS inStockCount

      FROM products
    `);

    // ===================================================
    // 7. WEEKLY SALES
    //
    // Always returns 7 days.
    // Days with no sales become 0.
    // ===================================================
    const [weeklySales] = await db.execute(`
      SELECT
        DATE(created_at) AS sale_date,
        COALESCE(SUM(grand_total), 0) AS sales
      FROM invoices
      WHERE created_at >= CURDATE() - INTERVAL 6 DAY
        AND created_at < CURDATE() + INTERVAL 1 DAY
        AND is_cancelled = 0
      GROUP BY DATE(created_at)
      ORDER BY sale_date ASC
    `);

    // Create lookup for actual sales
    const salesMap = {};

    weeklySales.forEach((row) => {
      const dateKey = new Date(row.sale_date)
        .toISOString()
        .split("T")[0];

      salesMap[dateKey] = Number(row.sales);
    });

    // Generate all 7 days
    const formattedWeeklySales = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(
        date.getDate() - i
      );

      const year = date.getFullYear();

      const month = String(
        date.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        date.getDate()
      ).padStart(2, "0");

      const dateKey =
        `${year}-${month}-${day}`;

      formattedWeeklySales.push({
        date: dateKey,
        sales: salesMap[dateKey] || 0,
      });
    }

    // ===================================================
    // 8. TOP SELLING PRODUCTS
    // ===================================================
    const [topProducts] = await db.execute(`
      SELECT
        p.id,
        p.name,
        SUM(ii.quantity) AS totalSold
      FROM invoice_items ii

      INNER JOIN products p
        ON p.id = ii.product_id

      INNER JOIN invoices i
        ON i.id = ii.invoice_id

      WHERE i.is_cancelled = 0

      GROUP BY
        p.id,
        p.name

      ORDER BY
        totalSold DESC

      LIMIT 5
    `);

    // ===================================================
    // 9. RECENT TRANSACTIONS
    // ===================================================
    const [recentTransactions] = await db.execute(`
      SELECT
        i.id,
        i.invoice_no,

        COALESCE(
          c.name,
          'Walk-in Customer'
        ) AS customer_name,

        i.grand_total,
        i.payment_status,
        i.created_at

      FROM invoices i

      LEFT JOIN customers c
        ON c.id = i.customer_id

      WHERE i.is_cancelled = 0

      ORDER BY
        i.created_at DESC

      LIMIT 5
    `);

    // ===================================================
    // 10. LOW / CRITICAL STOCK PRODUCTS
    //
    // SAME RULE AS ProductTable
    // ===================================================
    const [lowStockProducts] = await db.execute(`
      SELECT
        id AS product_id,
        name,
        stock,
        low_stock_threshold,
        low_stock_limit,

        CASE
          WHEN stock <= COALESCE(low_stock_limit, 5)
            THEN 'CRITICAL'

          WHEN stock <= COALESCE(low_stock_threshold, 10)
            THEN 'LOW'

          ELSE 'IN_STOCK'
        END AS status

      FROM products

      WHERE stock <= COALESCE(
        low_stock_threshold,
        10
      )

      ORDER BY
        stock ASC
    `);

    // ===================================================
    // 11. RESPONSE
    // ===================================================
    res.status(200).json({
      summary: {
        today_sales: Number(
          sales[0].totalSales
        ),

        today_invoices: Number(
          invoices[0].totalInvoices
        ),

        total_products: Number(
          products[0].totalProducts
        ),

        total_customers: Number(
          customers[0].totalCustomers
        ),

        stock_value: Number(
          stockValue[0].stockValue
        ),

        low_stock_count: Number(
          stockStatus[0].lowStockCount || 0
        ),

        critical_stock_count: Number(
          stockStatus[0].criticalCount || 0
        ),

        in_stock_count: Number(
          stockStatus[0].inStockCount || 0
        ),
      },

      // =================================================
      // 7-DAY SALES
      // =================================================
      weekly_sales: formattedWeeklySales,

      // =================================================
      // TOP PRODUCTS
      // =================================================
      top_products: topProducts.map(
        (product) => ({
          id: product.id,
          name: product.name,
          totalSold: Number(
            product.totalSold
          ),
        })
      ),

      // =================================================
      // RECENT TRANSACTIONS
      // =================================================
      recent_transactions:
        recentTransactions.map(
          (transaction) => ({
            id: transaction.id,

            invoice_no:
              transaction.invoice_no,

            customer_name:
              transaction.customer_name,

            grand_total: Number(
              transaction.grand_total
            ),

            payment_status:
              transaction.payment_status,

            created_at:
              transaction.created_at,
          })
        ),

      // =================================================
      // LOW / CRITICAL STOCK
      // =================================================
      low_stock_alerts:
        lowStockProducts.map(
          (product) => ({
            product_id:
              product.product_id,

            name: product.name,

            stock: Number(
              product.stock
            ),

            low_stock_threshold:
              Number(
                product.low_stock_threshold ??
                  10
              ),

            low_stock_limit:
              Number(
                product.low_stock_limit ??
                  5
              ),

            status:
              product.status,
          })
        ),
    });

  } catch (err) {
    console.error(
      "Dashboard error:",
      err
    );

    res.status(500).json({
      success: false,

      message:
        "Failed to load dashboard data.",

      error:
        err.message,
    });
  }
};