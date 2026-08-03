import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  Alert,
} from "@mui/material";

import { updateInvoicePayment } from "../../services/invoiceService";

function RecordPaymentDialog({
  open,
  onClose,
  invoice,
  onSuccess,
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!invoice) return null;

  const grandTotal = Number(invoice.grand_total || 0);
  const paidAmount = Number(invoice.paid_amount || 0);
  const dueAmount = Number(invoice.due_amount || 0);

  const handleClose = () => {
    if (loading) return;

    setAmount("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    const payment = Number(amount);

    if (!amount || Number.isNaN(payment)) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (payment <= 0) {
      setError("Payment must be greater than zero.");
      return;
    }

    if (payment > dueAmount) {
      setError(
        `Payment cannot exceed the remaining due of Rs. ${dueAmount.toFixed(
          2
        )}.`
      );
      return;
    }

    try {
      setLoading(true);

      await updateInvoicePayment(
        invoice.id,
        payment
      );

      setAmount("");
      setError("");

      if (onSuccess) {
        await onSuccess();
      }

      onClose();

    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to record payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: "#0F172A",
        }}
      >
        Record Payment
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 3,
            mt: 1,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Grand Total
            </Typography>

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Rs. {grandTotal.toFixed(2)}
            </Typography>
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Already Paid
            </Typography>

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Rs. {paidAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            backgroundColor: "#EEF2FF",
            borderRadius: 2,
            padding: 2,
            mb: 3,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Remaining Due
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
            color="#4F46E5"
          >
            Rs. {dueAmount.toFixed(2)}
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Payment Amount"
          placeholder="Enter amount"
          type="number"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          inputProps={{
            min: 0,
            max: dueAmount,
            step: "0.01",
          }}
          autoFocus
        />
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: "#64748B",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || dueAmount <= 0}
          sx={{
            backgroundColor: "#4F46E5",
            "&:hover": {
              backgroundColor: "#4338CA",
            },
          }}
        >
          {loading
            ? "Recording..."
            : "Record Payment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default RecordPaymentDialog;
