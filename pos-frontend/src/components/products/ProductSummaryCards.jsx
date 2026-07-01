import "./ProductSummaryCards.css";

function ProductSummaryCards({ products }) {
  const total = products.length;

  const inStock = products.filter(
    (product) => product.stock > 15
  ).length;

  const lowStock = products.filter(
    (product) => product.stock <= 15 && product.stock > 5
  ).length;

  const critical = products.filter(
    (product) => product.stock <= 5
  ).length;

  const cards = [
    {
      label: "Total Products",
      value: total,
      icon: "📦",
      color: "#173F35",
    },
    {
      label: "In Stock",
      value: inStock,
      icon: "✅",
      color: "#16A34A",
    },
    {
      label: "Low Stock",
      value: lowStock,
      icon: "⚠️",
      color: "#F59E0B",
    },
    {
      label: "Critical",
      value: critical,
      icon: "⛔",
      color: "#DC2626",
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <div
          className="summary-card"
          key={card.label}
        >
          <div className="summary-top">
            <div>
              <p>{card.label}</p>

              <h2 style={{ color: card.color }}>
                {card.value}
              </h2>
            </div>

            <div
              className="summary-icon"
              style={{
                background: `${card.color}15`,
              }}
            >
              <span style={{ fontSize: "28px" }}>
                {card.icon}
              </span>
            </div>
          </div>

          <div className="summary-bottom">
            Updated automatically from inventory
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductSummaryCards;