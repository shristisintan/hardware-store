import { useEffect, useState } from "react";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  createCustomer,
  updateCustomer,
} from "../../services/customerService";

const initialForm = {
  name: "",
  phone: "",
  address: "",
};

const COLORS = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primaryDark: "#3730A3",

  primaryLight: "#EEF2FF",
  primaryBorder: "#C7D2FE",

  text: "#0F172A",
  secondary: "#64748B",
  muted: "#94A3B8",

  border: "#E2E8F0",
  borderHover: "#CBD5E1",

  background: "#F8FAFC",
  white: "#FFFFFF",
};

export default function AddCustomerDialog({
  open,
  onClose,
  editData,
  onSuccess,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        phone: editData.phone || "",
        address: editData.address || "",
      });
    } else {
      setForm(initialForm);
    }

    setErrors({});
  }, [editData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === "phone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "name") {
      newValue = value.replace(/[^A-Za-z\s]/g, "");
    }

    if (name === "address") {
      newValue = value.slice(0, 50);
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    const name = form.name.trim();
    const phone = form.phone.trim();
    const address = form.address.trim();

    if (!name) {
      newErrors.name = "Customer name is required.";
    } else if (name.length < 2) {
      newErrors.name =
        "Customer name must be at least 2 characters.";
    } else if (name.length > 50) {
      newErrors.name =
        "Customer name cannot exceed 50 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      newErrors.name =
        "Customer name can contain letters and spaces only.";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^9[678]\d{8}$/.test(phone)) {
      newErrors.phone =
        "Enter a valid Nepal mobile number.";
    }

    if (address.length > 50) {
      newErrors.address =
        "Address cannot exceed 50 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || saving) return;

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      if (editData) {
        await updateCustomer(editData.id, payload);
      } else {
        await createCustomer(payload);
      }

      onSuccess();
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        "Something went wrong.";

      if (err.response?.status === 409) {
        setErrors((prev) => ({
          ...prev,
          phone: message,
        }));
        return;
      }

      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("name")) {
        setErrors((prev) => ({
          ...prev,
          name: message,
        }));
      } else if (lowerMessage.includes("phone")) {
        setErrors((prev) => ({
          ...prev,
          phone: message,
        }));
      } else if (lowerMessage.includes("address")) {
        setErrors((prev) => ({
          ...prev,
          address: message,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: message,
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "9px",
      backgroundColor: COLORS.white,

      "& fieldset": {
        borderColor: COLORS.border,
      },

      "&:hover fieldset": {
        borderColor: COLORS.borderHover,
      },

      "&.Mui-focused fieldset": {
        borderColor: COLORS.primary,
      },
    },

    "& .MuiInputLabel-root": {
      color: COLORS.secondary,
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: COLORS.primary,
    },

    "& .MuiInputBase-input": {
      color: COLORS.text,
      fontSize: 13,
    },

    "& .MuiFormHelperText-root": {
      fontSize: 11,
    },
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 2.5,
          pb: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 19,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          {editData ? "Edit Customer" : "Add Customer"}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 12,
            color: COLORS.secondary,
          }}
        >
          {editData
            ? "Update customer information."
            : "Add a new customer to your store."}
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={{
          px: 3,
          pt: 2,
          pb: 1,
        }}
      >
        {errors.general && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: "8px",
            }}
          >
            {errors.general}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            required
            name="name"
            label="Customer Name"
            fullWidth
            size="small"
            value={form.name}
            onChange={handleChange}
            error={Boolean(errors.name)}
            helperText={errors.name}
            sx={fieldSx}
            slotProps={{
              htmlInput: {
                maxLength: 50,
              },
            }}
          />

          <TextField
            required
            name="phone"
            label="Phone Number"
            fullWidth
            size="small"
            value={form.phone}
            onChange={handleChange}
            error={Boolean(errors.phone)}
            helperText={
              errors.phone ||
              "Enter a 10-digit Nepal mobile number."
            }
            slotProps={{
              htmlInput: {
                maxLength: 10,
                inputMode: "numeric",
              },
            }}
            sx={fieldSx}
          />

          <TextField
            name="address"
            label="Address"
            fullWidth
            size="small"
            value={form.address}
            onChange={handleChange}
            error={Boolean(errors.address)}
            helperText={
              errors.address ||
              `${form.address.length}/50 characters`
            }
            slotProps={{
              htmlInput: {
                maxLength: 50,
              },
            }}
            sx={fieldSx}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          gap: 1,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            color: COLORS.secondary,
            px: 2,

            "&:hover": {
              backgroundColor: COLORS.background,
              color: COLORS.text,
            },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSubmit}
          sx={{
            backgroundColor: COLORS.primary,
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
            fontWeight: 600,
            boxShadow: "none",

            "&:hover": {
              backgroundColor: COLORS.primaryHover,
              boxShadow: "none",
            },

            "&:active": {
              backgroundColor: COLORS.primaryDark,
            },
          }}
        >
          {saving
            ? "Saving..."
            : editData
            ? "Update Customer"
            : "Add Customer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
