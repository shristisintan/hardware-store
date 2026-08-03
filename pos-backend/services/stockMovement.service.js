const recordMovement = async (
  connection,
  {
    productId,
    userId = null,
    invoiceId = null,
    type,
    quantity,
    stockBefore,
    stockAfter,
    reason = null,
  }
) => {
  await connection.execute(
    `INSERT INTO stock_movements
     (product_id, user_id, invoice_id, type, quantity, stock_before, stock_after, reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      productId,
      userId,
      invoiceId,
      type,
      quantity,
      stockBefore,
      stockAfter,
      reason,
    ]
  );
};

module.exports = { recordMovement };