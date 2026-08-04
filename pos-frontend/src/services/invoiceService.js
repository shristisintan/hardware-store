import api from "./api";

// ===============================
// CREATE INVOICE
// ===============================
export const createInvoice = async (
  customer_id
) => {
  const res = await api.post(
    "/invoices",
    {
      customer_id,
    }
  );

  return res.data;
};

// ===============================
// ADD INVOICE ITEM
// ===============================
export const addInvoiceItem =
  async (data) => {
    const res = await api.post(
      "/invoice-items/add",
      data
    );

    return res.data;
  };

// ===============================
// UPDATE INVOICE ITEM
// ===============================
export const updateInvoiceItem =
  async (id, data) => {
    const res = await api.put(
      `/invoice-items/${id}`,
      data
    );

    return res.data;
  };

// ===============================
// DELETE INVOICE ITEM
// ===============================
export const deleteInvoiceItem =
  async (id) => {
    const res = await api.delete(
      `/invoice-items/${id}`
    );

    return res.data;
  };

// ===============================
// GET SINGLE INVOICE
// ===============================
export const getInvoice =
  async (id) => {
    const res = await api.get(
      `/invoices/${id}`
    );

    return res.data;
  };

// ===============================
// GET ALL INVOICES
// ===============================
export const getInvoices =
  async () => {
    const res = await api.get(
      "/invoices"
    );

    return res.data;
  };

// ===============================
// UPDATE TOTAL PAID AMOUNT
//
// paidAmount = TOTAL amount paid
// so far, NOT an additional payment.
//
// Example:
// Invoice = 1000
// Existing paid = 300
// Send 500
// Result = paid 500, due 500
// ===============================
export const updatePayment =
  async (
    invoiceId,
    paidAmount
  ) => {
    const res = await api.put(
      `/invoices/${invoiceId}/payment`,
      {
        paid_amount:
          paidAmount,
      }
    );

    return res.data;
  };

// ===============================
// APPLY DISCOUNT
// ===============================
export const applyDiscount =
  async (
    id,
    discount_amount,
    discount_percentage = null
  ) => {
    const res = await api.put(
      `/invoices/${id}/discount`,
      {
        discount_amount,
        discount_percentage,
      }
    );

    return res.data;
  };

// ===============================
// FINALIZE INVOICE
// ===============================
export const finalizeInvoice =
  async (id) => {
    const res = await api.post(
      `/invoices/${id}/finalize`
    );

    return res.data;
  };

// ===============================
// CANCEL INVOICE
// ===============================
export const cancelInvoice =
  async (id) => {
    const res = await api.post(
      `/invoices/${id}/cancel`
    );

    return res.data;
  };