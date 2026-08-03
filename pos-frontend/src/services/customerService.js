import api from "./api";

export const getCustomers = async () => {
  const res = await api.get("/customers");
  return res.data;
};

export const getCustomer = async (id) => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};

export const createCustomer = async (data) => {
  const res = await api.post("/customers", data);
  return res.data;
};

export const updateCustomer = async (id, data) => {
  const res = await api.put(`/customers/${id}`, data);
  return res.data;
};

export const deleteCustomer = async (id) => {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
};

export const searchCustomers = async (keyword) => {
  const res = await api.get("/customers/search", {
    params: { keyword },
  });

  return res.data;
};

export const getCustomerHistory = async (id) => {
  const res = await api.get(`/customers/${id}/history`);
  return res.data;
};

export const getCustomerDueSummary = async (id) => {
  const res = await api.get(`/customers/${id}/due-summary`);
  return res.data;
};