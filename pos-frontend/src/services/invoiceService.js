import api from "./api";

export const createInvoice = async (customer_id) => {
  const res = await api.post("/invoices", {
    customer_id,
  });

  return res.data;
};

export const addInvoiceItem = async (data) => {
  const res = await api.post("/invoice-items/add", data);

  return res.data;
};

export const updateInvoiceItem = async (id, data) => {
  const res = await api.put(`/invoice-items/${id}`, data);

  return res.data;
};

export const deleteInvoiceItem = async (id) => {
  const res = await api.delete(`/invoice-items/${id}`);

  return res.data;
};

export const updatePayment = async (id, paid_amount) => {
  const res = await api.put(`/invoices/${id}/payment`, {
    paid_amount,
  });

  return res.data;
};

export const finalizeInvoice = async (id) => {
  const res = await api.post(`/invoices/${id}/finalize`);

  return res.data;
};

export const cancelInvoice = async (id) => {
  const res = await api.post(`/invoices/${id}/cancel`);

  return res.data;
};

export const getInvoice = async (id) => {
  const res = await api.get(`/invoices/${id}`);

  return res.data;
};

export const getInvoices = async () => {
  const res = await api.get("/invoices");

  return res.data;
};

export const applyDiscount = async (
  id,
  discount_amount,
  discount_percentage = null
) => {
  const res = await api.put(`/invoices/${id}/discount`, {
    discount_amount,
    discount_percentage,
  });

  return res.data;
};


// ===============================
// UPDATE INVOICE PAYMENT
// ===============================
export const updateInvoicePayment = async (
  invoiceId,
  paidAmount
) => {
  const response = await api.put(
    `/invoices/${invoiceId}/payment`,
    {
      paid_amount: paidAmount,
    }
  );

  return response.data;
};
