import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
  Box,
  Typography,
  Divider,
} from "@mui/material";

import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

import { useEffect, useRef, useState } from "react";

import {
  createProduct,
  updateProduct,
} from "../../services/productService";

function AddProductDialog({
  open,
  onClose,
  onSuccess,
  editData,
}) {
  const isEditMode = Boolean(editData);

  const emptyForm = {
    name: "",
    category: "",
    purchase_price: "",
    stock: "",
    unit: "",
    low_stock_threshold: 10,
    low_stock_limit: 5,
  };

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fieldRefs = {
    name: useRef(null),
    category: useRef(null),
    purchase_price: useRef(null),
    stock: useRef(null),
    unit: useRef(null),
    low_stock_threshold: useRef(null),
    low_stock_limit: useRef(null),
  };

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        category: editData.category || "",
        purchase_price: editData.purchase_price ?? "",
        stock: editData.stock ?? "",
        unit: editData.unit || "",
        low_stock_threshold:
          editData.low_stock_threshold ?? 10,
        low_stock_limit:
          editData.low_stock_limit ?? 5,
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [editData, open]);

  const focusField = (field) => {
    const input = fieldRefs[field]?.current;

    if (!input) return;

    setTimeout(() => {
      input.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      input.focus();
    }, 100);
  };

  const focusFirstError = (errorObject) => {
    const field = Object.keys(errorObject)[0];

    if (field && fieldRefs[field]) {
      focusField(field);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
      submit: "",
    }));
  };

  const validate = () => {
    const temp = {};

    if (!form.name.trim()) {
      temp.name = "Product name is required";
    } else if (!/^[a-zA-Z0-9 ]+$/.test(form.name)) {
      temp.name =
        "Only letters, numbers and spaces allowed";
    }

    if (!form.category.trim()) {
      temp.category = "Category is required";
    } else if (!/^[a-zA-Z ]+$/.test(form.category)) {
      temp.category =
        "Only letters and spaces allowed";
    }

    if (form.purchase_price === "") {
      temp.purchase_price =
        "Purchase price is required";
    } else if (
      isNaN(form.purchase_price) ||
      Number(form.purchase_price) < 0
    ) {
      temp.purchase_price = "Must be ≥ 0";
    }

    if (form.stock === "") {
      temp.stock = "Stock is required";
    } else if (
      isNaN(form.stock) ||
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      temp.stock =
        "Must be a whole number ≥ 0";
    }

    if (!form.unit.trim()) {
      temp.unit = "Unit is required";
    } else if (!/^[a-zA-Z]+$/.test(form.unit)) {
      temp.unit = "Only letters allowed";
    }

    if (
      form.low_stock_threshold === "" ||
      isNaN(form.low_stock_threshold) ||
      Number(form.low_stock_threshold) < 0 ||
      !Number.isInteger(
        Number(form.low_stock_threshold)
      )
    ) {
      temp.low_stock_threshold =
        "Must be a whole number ≥ 0";
    }

    if (
      form.low_stock_limit === "" ||
      isNaN(form.low_stock_limit) ||
      Number(form.low_stock_limit) < 0 ||
      !Number.isInteger(
        Number(form.low_stock_limit)
      )
    ) {
      temp.low_stock_limit =
        "Must be a whole number ≥ 0";
    }

    if (
      !temp.low_stock_threshold &&
      !temp.low_stock_limit &&
      Number(form.low_stock_threshold) <=
        Number(form.low_stock_limit)
    ) {
      temp.low_stock_threshold =
        "Must be greater than the critical limit";
    }

    setErrors(temp);

    if (Object.keys(temp).length) {
      focusFirstError(temp);
      return false;
    }

    return true;
  };

  const getBackendField = (message) => {
    const text = message.toLowerCase();

    if (
      text.includes("product name") ||
      text.includes("name already") ||
      text.includes("duplicate name")
    ) {
      return "name";
    }

    if (text.includes("category")) {
      return "category";
    }

    if (
      text.includes("purchase price") ||
      text.includes("price")
    ) {
      return "purchase_price";
    }

    if (text.includes("stock")) {
      return "stock";
    }

    if (text.includes("unit")) {
      return "unit";
    }

    if (
      text.includes("low stock threshold") ||
      text.includes("threshold")
    ) {
      return "low_stock_threshold";
    }

    if (
      text.includes("critical") ||
      text.includes("low stock limit")
    ) {
      return "low_stock_limit";
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!validate() || saving) return;

    setSaving(true);
    setErrors({});

    try {
      const data = {
        ...form,
        purchase_price: Number(form.purchase_price),
        stock: Number(form.stock),
        low_stock_threshold: Number(
          form.low_stock_threshold
        ),
        low_stock_limit: Number(
          form.low_stock_limit
        ),
      };

      if (isEditMode) {
        await updateProduct(editData.id, data);
      } else {
        await createProduct(data);
      }

      onSuccess();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to save product.";

      const field = getBackendField(message);

      if (field) {
        setErrors({
          [field]: message,
        });

        focusField(field);
      } else {
        setErrors({
          submit: message,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldProps = (field) => ({
    inputRef: fieldRefs[field],
    error: Boolean(errors[field]),
    helperText: errors[field],
  });

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#F8FAFC",

      "& fieldset": {
        borderColor: "#E2E8F0",
      },

      "&:hover fieldset": {
        borderColor: "#CBD5E1",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#4F46E5",
      },
    },

    "& .MuiInputLabel-root": {
      fontSize: "14px",
    },

    "& input": {
      fontSize: "14px",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {/* HEADER */}

      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EEF2FF",
              color: "#4F46E5",
            }}
          >
            {isEditMode ? (
              <EditRoundedIcon />
            ) : (
              <AddBoxRoundedIcon />
            )}
          </Box>

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              color="#0F172A"
            >
              {isEditMode
                ? "Edit Product"
                : "Add Product"}
            </Typography>

            <Typography
              variant="body2"
              color="#64748B"
            >
              {isEditMode
                ? "Update product information and stock settings."
                : "Add a new product to your inventory."}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      {/* CONTENT */}

      <DialogContent
        sx={{
          px: 3,
          py: 3,
        }}
      >
        <Stack spacing={3}>
          {/* PRODUCT INFORMATION */}

          <Box>
            <Typography
              fontSize={13}
              fontWeight={700}
              color="#334155"
              mb={1.5}
            >
              Product Information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Product Name"
                required
                fullWidth
                value={form.name}
                onChange={(e) =>
                  handleChange(
                    "name",
                    e.target.value
                  )
                }
                {...fieldProps("name")}
                sx={inputSx}
              />

              <TextField
                label="Category"
                required
                fullWidth
                value={form.category}
                onChange={(e) =>
                  handleChange(
                    "category",
                    e.target.value
                  )
                }
                {...fieldProps("category")}
                sx={inputSx}
              />

              <TextField
                label="Purchase Price"
                required
                fullWidth
                type="number"
                value={form.purchase_price}
                onChange={(e) =>
                  handleChange(
                    "purchase_price",
                    e.target.value
                  )
                }
                {...fieldProps("purchase_price")}
                sx={inputSx}
                inputProps={{
                  min: 0,
                }}
              />

              <TextField
                label="Unit"
                required
                fullWidth
                value={form.unit}
                onChange={(e) =>
                  handleChange(
                    "unit",
                    e.target.value
                  )
                }
                {...fieldProps("unit")}
                sx={inputSx}
                placeholder="pcs, box, kg..."
              />
            </Box>
          </Box>

          <Divider />

          {/* INVENTORY */}

          <Box>
            <Typography
              fontSize={13}
              fontWeight={700}
              color="#334155"
              mb={1.5}
            >
              Inventory & Stock Alerts
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Current Stock"
                required
                fullWidth
                type="number"
                value={form.stock}
                onChange={(e) =>
                  handleChange(
                    "stock",
                    e.target.value
                  )
                }
                {...fieldProps("stock")}
                sx={inputSx}
                inputProps={{
                  min: 0,
                  step: 1,
                }}
              />

              <TextField
                label="Low Stock Threshold"
                required
                fullWidth
                type="number"
                value={
                  form.low_stock_threshold
                }
                onChange={(e) =>
                  handleChange(
                    "low_stock_threshold",
                    e.target.value
                  )
                }
                {...fieldProps(
                  "low_stock_threshold"
                )}
                sx={inputSx}
                inputProps={{
                  min: 0,
                  step: 1,
                }}
              />

              <TextField
                label="Critical Stock Limit"
                required
                fullWidth
                type="number"
                value={form.low_stock_limit}
                onChange={(e) =>
                  handleChange(
                    "low_stock_limit",
                    e.target.value
                  )
                }
                {...fieldProps(
                  "low_stock_limit"
                )}
                sx={inputSx}
                inputProps={{
                  min: 0,
                  step: 1,
                }}
              />
            </Box>

            <Typography
              variant="caption"
              color="#94A3B8"
              sx={{
                display: "block",
                mt: 1.5,
              }}
            >
              Low Stock marks products at or below
              the threshold. Critical marks products
              at or below the critical limit.
            </Typography>
          </Box>

          {/* BACKEND ERROR */}

          {errors.submit && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
              }}
            >
              {errors.submit}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      {/* ACTIONS */}

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#F8FAFC",
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{
            px: 2.5,
            borderRadius: 2,
            textTransform: "none",
            color: "#475569",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            px: 2.5,
            minWidth: 130,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,

            backgroundColor: "#4F46E5",

            boxShadow: "none",

            "&:hover": {
              backgroundColor: "#4338CA",
              boxShadow: "none",
            },
          }}
        >
          {saving
            ? "Saving..."
            : isEditMode
              ? "Update Product"
              : "Add Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddProductDialog;
