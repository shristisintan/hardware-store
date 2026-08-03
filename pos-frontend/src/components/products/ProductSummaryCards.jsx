
import {
  Inventory2,
  CheckCircle,
  Warning,
  Error,
} from "@mui/icons-material";

import "./ProductSummaryCards.css";

function getStatus(product) {
  const stock = Number(product.stock);

  const threshold = Number(
    product.low_stock_threshold ?? 10
  );

  const limit = Number(
    product.low_stock_limit ?? 5
  );

  if (stock <= limit) {
    return "critical";
  }

  if (stock <= threshold) {
    return "low";
  }

  return "instock";
}

function ProductSummaryCards({ products = [] }) {
  const total = products.length;

  const inStock = products.filter(
    (product) => getStatus(product) === "instock"
  ).length;

  const lowStock = products.filter(
    (product) => getStatus(product) === "low"
  ).length;

  const critical = products.filter(
    (product) => getStatus(product) === "critical"
  ).length;

  return (
    <div className="inventory-overview">
      <div className="inventory-overview-header">
        <div>
          <h3>Inventory Overview</h3>
          <p>Current stock status</p>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="inventory-stat">
          <div className="inventory-stat-icon total">
            <Inventory2 />
          </div>

          <div>
            <span>Total Products</span>
            <strong>{total}</strong>
          </div>
        </div>

        <div className="inventory-stat">
          <div className="inventory-stat-icon success">
            <CheckCircle />
          </div>

          <div>
            <span>In Stock</span>
            <strong>{inStock}</strong>
          </div>
        </div>

        <div className="inventory-stat">
          <div className="inventory-stat-icon warning">
            <Warning />
          </div>

          <div>
            <span>Low Stock</span>
            <strong>{lowStock}</strong>
          </div>
        </div>

        <div className="inventory-stat">
          <div className="inventory-stat-icon danger">
            <Error />
          </div>

          <div>
            <span>Critical</span>
            <strong>{critical}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSummaryCards;

