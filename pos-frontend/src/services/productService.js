import api from "./api";

// GET
export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

// CREATE
export const createProduct = async (data) => {
  const res = await api.post("/products", data);
  return res.data;
};

// DELETE
export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

// UPDATE
export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};