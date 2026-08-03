import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

import {
  TrendingUp,
  Inventory2,
  People,
  ReceiptLong,
  ArrowForward,
  PointOfSale,
  WarningAmber,
  ShoppingCart,
} from "@mui/icons-material";

import { getDashboard } from "../services/dashboardService";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboard();

        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard loading error:", err);

        setError(
          err?.response?.data?.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================================================
  // DATA
  // =========================================================

  const summary = dashboardData?.summary || {};

  const recentTransactions =
    dashboardData?.recent_transactions || [];

  const lowStockAlerts =
    dashboardData?.low_stock_alerts || [];

  const topProducts =
    dashboardData?.top_products || [];

  // =========================================================
  // STOCK COUNTS
  //
  // Use the actual alert status returned by backend.
  // =========================================================

  const criticalStockCount = lowStockAlerts.filter(
    (product) =>
      product.status === "CRITICAL" ||
      product.status === "OUT_OF_STOCK"
  ).length;

  const lowStockCount = lowStockAlerts.filter(
    (product) => product.status === "LOW"
  ).length;

  // =========================================================
  // WEEKLY SALES
  // =========================================================

  const weeklySales = useMemo(() => {
    const sales = dashboardData?.weekly_sales || [];

    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      days.push({
        dateKey: date.toLocaleDateString("en-CA"),
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        sales: 0,
      });
    }

    sales.forEach((item) => {
      const itemDate = new Date(item.date);

      const dateKey =
        itemDate.toLocaleDateString("en-CA");

      const matchingDay = days.find(
        (day) => day.dateKey === dateKey
      );

      if (matchingDay) {
        matchingDay.sales += Number(item.sales || 0);
      }
    });

    return days;
  }, [dashboardData]);

  const maxSales = Math.max(
    ...weeklySales.map((day) => day.sales),
    1
  );

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `Rs. ${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Overview of your store"
      >
        <div className="dashboard">
          <div className="dashboard-loading">
            Loading dashboard...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <DashboardLayout
        title="Dashboard"
        subtitle="Overview of your store"
      >
        <div className="dashboard">
          <div className="dashboard-error">
            <h3>Unable to load dashboard</h3>

            <p>{error}</p>

            <button
              onClick={() =>
                window.location.reload()
              }
            >
              Try again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =========================================================
  // SUMMARY CARDS
  // =========================================================

  const stats = [
    {
      title: "Today's Sales",
      value: formatCurrency(summary.today_sales),
      description: "Sales recorded today",
      icon: <TrendingUp />,
      type: "sales",
    },
    {
      title: "Inventory Value",
      value: formatCurrency(summary.stock_value),
      description: "Current stock value",
      icon: <Inventory2 />,
      type: "inventory",
    },
    {
      title: "Customers",
      value: Number(
        summary.total_customers || 0
      ).toLocaleString(),
      description: "Registered customers",
      icon: <People />,
      type: "customers",
    },
    {
      title: "Invoices",
      value: Number(
        summary.today_invoices || 0
      ).toLocaleString(),
      description: "Invoices created today",
      icon: <ReceiptLong />,
      type: "invoices",
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Overview of your store"
    >
      <div className="dashboard">

        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="dashboard-welcome">

          <div>
            <h1>Welcome back, Admin</h1>

            <p>
              Here's what's happening at Shuva Stores today.
            </p>
          </div>

          <button
            className="quick-sale-button"
            onClick={() => navigate("/billing")}
          >
            <PointOfSale />
            New Sale
          </button>

        </section>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="dashboard-stats">

          {stats.map((stat) => (
            <div
              className={`dashboard-stat-card ${stat.type}`}
              key={stat.title}
            >
              <div className="stat-icon">
                {stat.icon}
              </div>

              <div className="stat-content">
                <span className="stat-title">
                  {stat.title}
                </span>

                <strong className="stat-value">
                  {stat.value}
                </strong>

                <span className="stat-description">
                  {stat.description}
                </span>
              </div>
            </div>
          ))}

        </section>


        {/* =================================================
            STOCK ALERTS
        ================================================= */}

        <section className="dashboard-stock-section">

          <div className="stock-alert-card low-stock">

            <div className="stock-alert-header">

              <div className="stock-alert-icon">
                <WarningAmber />
              </div>

              <div>
                <h2>Low Stock</h2>

                <p>
                  Products approaching minimum stock
                </p>
              </div>

            </div>

            <div className="stock-alert-number">
              {lowStockCount}
            </div>

            <button
              className="stock-alert-action"
              onClick={() => navigate("/products")}
            >
              View products
              <ArrowForward />
            </button>

          </div>


          <div className="stock-alert-card critical-stock">

            <div className="stock-alert-header">

              <div className="stock-alert-icon">
                <WarningAmber />
              </div>

              <div>
                <h2>Critical Stock</h2>

                <p>
                  Products requiring immediate attention
                </p>
              </div>

            </div>

            <div className="stock-alert-number">
              {criticalStockCount}
            </div>

            <button
              className="stock-alert-action"
              onClick={() => navigate("/products")}
            >
              View products
              <ArrowForward />
            </button>

          </div>

        </section>


        {/* =================================================
            SALES + RECENT SALES
        ================================================= */}

        <section className="dashboard-grid">

          {/* SALES OVERVIEW */}

          <div className="dashboard-panel sales-panel">

            <div className="panel-header">

              <div>
                <h2>Sales Overview</h2>

                <p>
                  Sales performance over the last 7 days
                </p>
              </div>

              <TrendingUp className="panel-header-icon" />

            </div>


            <div className="sales-chart">

              <div className="chart-y-axis">

                <span>
                  {formatCurrency(maxSales)}
                </span>

                <span>
                  {formatCurrency(maxSales * 0.75)}
                </span>

                <span>
                  {formatCurrency(maxSales * 0.5)}
                </span>

                <span>
                  {formatCurrency(maxSales * 0.25)}
                </span>

                <span>Rs. 0</span>

              </div>


              <div className="chart-area">

                <div className="chart-grid-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>


                <div className="chart-bars">

                  {weeklySales.map((day) => {

                    const height =
                      day.sales > 0
                        ? Math.max(
                            (day.sales / maxSales) * 100,
                            4
                          )
                        : 0;

                    return (
                      <div
                        className="chart-column"
                        key={day.dateKey}
                      >

                        <div className="chart-bar-wrapper">

                          {day.sales > 0 && (
                            <span className="chart-value">
                              {formatCurrency(day.sales)}
                            </span>
                          )}

                          <div
                            className="chart-bar"
                            style={{
                              height: `${height}%`,
                            }}
                          />

                        </div>

                        <span className="chart-day">
                          {day.label}
                        </span>

                      </div>
                    );
                  })}

                </div>

              </div>

            </div>

          </div>


          {/* RECENT SALES */}

          <div className="dashboard-panel recent-sales-panel">

            <div className="panel-header">

              <div>
                <h2>Recent Sales</h2>

                <p>
                  Latest transactions
                </p>
              </div>

              <button
                className="panel-action"
                onClick={() => navigate("/sales")}
              >
                View all
                <ArrowForward />
              </button>

            </div>


            <div className="recent-sales-list">

              {recentTransactions.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    <ShoppingCart />
                  </div>

                  <h3>No sales yet</h3>

                  <p>
                    Your latest invoices will appear here.
                  </p>

                </div>

              ) : (

                recentTransactions.map(
                  (transaction) => (
                    <div
                      className="recent-sale-item"
                      key={transaction.id}
                    >

                      <div className="recent-sale-info">

                        <strong>
                          {transaction.invoice_no}
                        </strong>

                        <span>
                          {transaction.customer_name}
                        </span>

                      </div>


                      <div className="recent-sale-right">

                        <strong>
                          {formatCurrency(
                            transaction.grand_total
                          )}
                        </strong>

                        <span
                          className={`payment-status ${String(
                            transaction.payment_status || ""
                          ).toLowerCase()}`}
                        >
                          {transaction.payment_status}
                        </span>

                      </div>

                    </div>
                  )
                )

              )}

            </div>

          </div>

        </section>


        {/* =================================================
            INVENTORY OVERVIEW
        ================================================= */}

        <section className="dashboard-panel inventory-panel">

          <div className="panel-header">

            <div>
              <h2>Inventory Overview</h2>

              <p>
                Current stock requiring attention
              </p>
            </div>

            <button
              className="panel-action"
              onClick={() => navigate("/products")}
            >
              View products
              <ArrowForward />
            </button>

          </div>


          <div className="inventory-content">

            <div className="inventory-stat">

              <div className="inventory-stat-icon">
                <Inventory2 />
              </div>

              <div>
                <span>Total Products</span>

                <strong>
                  {Number(
                    summary.total_products || 0
                  ).toLocaleString()}
                </strong>
              </div>

            </div>


            <div className="inventory-stat">

              <div className="inventory-stat-icon low">
                <WarningAmber />
              </div>

              <div>
                <span>Low Stock</span>

                <strong>
                  {lowStockCount}
                </strong>
              </div>

            </div>


            <div className="inventory-stat">

              <div className="inventory-stat-icon critical">
                <WarningAmber />
              </div>

              <div>
                <span>Critical</span>

                <strong>
                  {criticalStockCount}
                </strong>
              </div>

            </div>


            <div className="inventory-stat">

              <div className="inventory-stat-icon value">
                <TrendingUp />
              </div>

              <div>
                <span>Stock Value</span>

                <strong>
                  {formatCurrency(
                    summary.stock_value
                  )}
                </strong>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            TOP SELLING PRODUCTS
        ================================================= */}

        {topProducts.length > 0 && (

          <section className="dashboard-panel top-products-panel">

            <div className="panel-header">

              <div>
                <h2>Top Selling Products</h2>

                <p>
                  Best performing products
                </p>
              </div>

              <button
                className="panel-action"
                onClick={() =>
                  navigate("/reports")
                }
              >
                View reports
                <ArrowForward />
              </button>

            </div>


            <div className="top-products-list">

              {topProducts.map(
                (product, index) => (

                  <div
                    className="top-product-item"
                    key={product.id}
                  >

                    <div className="top-product-rank">
                      #{index + 1}
                    </div>


                    <div className="top-product-info">

                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {Number(
                          product.totalSold || 0
                        ).toLocaleString()}{" "}
                        units sold
                      </span>

                    </div>


                    <div className="top-product-value">
                      {Number(
                        product.totalSold || 0
                      ).toLocaleString()}
                    </div>

                  </div>

                )
              )}

            </div>

          </section>

        )}

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;