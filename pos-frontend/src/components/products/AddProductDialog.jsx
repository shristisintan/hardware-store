import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";

import { useEffect, useState } from "react";
import { createProduct, updateProduct } from "../../services/productService";

function AddProductDialog({ open, onClose, onSuccess, editData }) {
  const isEditMode = Boolean(editData);

  const [form, setForm] = useState({
    name: "",
    category: "",
    purchase_price: "",
    stock: "",
    unit: "",
  });

  const [errors, setErrors] = useState({});

  // ===============================
  // PREFILL WHEN EDITING
  // ===============================
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        category: editData.category || "",
        purchase_price: editData.purchase_price || "",
        stock: editData.stock || "",
        unit: editData.unit || "",
      });
    } else {
      setForm({
        name: "",
        category: "",
        purchase_price: "",
        stock: "",
        unit: "",
      });
    }

    setErrors({});
  }, [editData, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ===============================
  // VALIDATION
  // ===============================
  const validate = () => {
    let temp = {};

    // Name
    if (!form.name.trim()) {
      temp.name = "Product name is required";
    } else if (!/^[a-zA-Z0-9 ]+$/.test(form.name)) {
      temp.name = "Only letters, numbers and spaces allowed";
    }

    // Category
    if (!form.category.trim()) {
      temp.category = "Category is required";
    } else if (!/^[a-zA-Z ]+$/.test(form.category)) {
      temp.category = "Only letters and spaces allowed";
    }

    // Price
    if (form.purchase_price === "") {
      temp.purchase_price = "Required";
    } else if (isNaN(form.purchase_price) || form.purchase_price < 0) {
      temp.purchase_price = "Must be ≥ 0";
    }

    // Stock
    if (form.stock === "") {
      temp.stock = "Required";
    } else if (isNaN(form.stock) || form.stock < 0) {
      temp.stock = "Must be ≥ 0";
    }

    // Unit
    if (!form.unit.trim()) {
      temp.unit = "Unit is required";
    } else if (!/^[a-zA-Z]+$/.test(form.unit)) {
      temp.unit = "Only letters allowed";
    }

    setErrors(temp);

    return Object.keys(temp).length === 0;
  };

  // ===============================
  // SUBMIT (CREATE + UPDATE)
  // ===============================
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isEditMode) {
        await updateProduct(editData.id, form);
      } else {
        await createProduct(form);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditMode ? "Edit Product" : "Add Product"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>

          <TextField
            label="Product Name *"
            fullWidth
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            label="Category *"
            fullWidth
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            error={!!errors.category}
            helperText={errors.category}
          />

          <TextField
            label="Purchase Price *"
            fullWidth
            type="number"
            value={form.purchase_price}
            onChange={(e) => handleChange("purchase_price", e.target.value)}
            error={!!errors.purchase_price}
            helperText={errors.purchase_price}
          />

          <TextField
            label="Stock *"
            fullWidth
            type="number"
            value={form.stock}
            onChange={(e) => handleChange("stock", e.target.value)}
            error={!!errors.stock}
            helperText={errors.stock}
          />

          <TextField
            label="Unit *"
            fullWidth
            value={form.unit}
            onChange={(e) => handleChange("unit", e.target.value)}
            error={!!errors.unit}
            helperText={errors.unit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />

        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ backgroundColor: "#173F35" }}
        >
          {isEditMode ? "Update Product" : "Add Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddProductDialog;