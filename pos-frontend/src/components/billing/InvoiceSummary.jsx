import {
  Paper,
  Typography,
  Divider,
  Stack,
  TextField,
  Chip,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
} from "@mui/material";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  text: "#0F172A",
  secondary: "#64748B",
  background: "#F7F7F5",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

function InvoiceSummary({
  cart = [],
  paidAmount,
  setPaidAmount,
  discountType,
  setDiscountType,
  discountValue,
  setDiscountValue,
  onFinalize,
  onCancel,
}) {
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );

  const rawDiscount = Number(discountValue || 0);

  const discountAmount =
    discountType === "percentage"
      ? Math.min(
          subtotal,
          subtotal *
            (Math.min(Math.max(rawDiscount, 0), 100) / 100)
        )
      : Math.min(
          subtotal,
          Math.max(rawDiscount, 0)
        );

  const grandTotal = Math.max(
    subtotal - discountAmount,
    0
  );

  const paid = Math.max(
    Number(paidAmount || 0),
    0
  );

  const due = Math.max(
    grandTotal - paid,
    0
  );

  const status =
    paid === 0
      ? "CREDIT"
      : paid < grandTotal
        ? "PARTIAL"
        : "PAID";

  const statusStyles =
    status === "PAID"
      ? {
          backgroundColor: "#ECFDF5",
          color: "#047857",
        }
      : status === "PARTIAL"
        ? {
            backgroundColor: "#FFFBEB",
            color: "#B45309",
          }
        : {
            backgroundColor: "#FEF2F2",
            color: "#B91C1C",
          };

  const handleDiscountChange = (event) => {
    let value = event.target.value;

    if (value === "") {
      setDiscountValue("");
      return;
    }

    value = Number(value);

    if (discountType === "percentage") {
      value = Math.min(
        Math.max(value, 0),
        100
      );
    } else {
      value = Math.min(
        Math.max(value, 0),
        subtotal
      );
    }

    setDiscountValue(value);
  };

  const handlePaidChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setPaidAmount("");
      return;
    }

    const amount = Math.max(
      Number(value),
      0
    );

    setPaidAmount(
      Math.min(amount, grandTotal)
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: { xs: 2, md: 2.5 },
        borderRadius: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.white,
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 1.5,
              backgroundColor: COLORS.primaryLight,
              color: COLORS.primary,
            }}
          >
            <ReceiptLongRoundedIcon
              sx={{
                fontSize: 19,
              }}
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.text,
                lineHeight: 1.3,
              }}
            >
              Invoice Summary
            </Typography>

            <Typography
              sx={{
                fontSize: 11,
                color: COLORS.secondary,
                mt: 0.2,
              }}
            >
              Review payment and finalize the sale
            </Typography>
          </Box>
        </Box>

        <Chip
          label={status}
          size="small"
          sx={{
            ...statusStyles,
            height: 25,
            borderRadius: 1.25,
            fontSize: 10.5,
            fontWeight: 800,
          }}
        />
      </Box>

      {/* TOTALS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr 1fr",
            sm: "repeat(4, 1fr)",
          },
          gap: 1.5,
          p: 1.75,
          borderRadius: 2,
          backgroundColor: COLORS.background,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 10.5,
              color: COLORS.secondary,
            }}
          >
            Items
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            {cart.length}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 10.5,
              color: COLORS.secondary,
            }}
          >
            Subtotal
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Rs. {subtotal.toFixed(2)}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 10.5,
              color: COLORS.secondary,
            }}
          >
            Discount
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              fontSize: 14,
              fontWeight: 700,
              color:
                discountAmount > 0
                  ? COLORS.primary
                  : COLORS.text,
            }}
          >
            Rs. {discountAmount.toFixed(2)}
          </Typography>
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 10.5,
              color: COLORS.secondary,
            }}
          >
            Grand Total
          </Typography>

          <Typography
            sx={{
              mt: 0.15,
              fontSize: 18,
              fontWeight: 800,
              color: COLORS.primary,
            }}
          >
            Rs. {grandTotal.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Divider
        sx={{
          my: 2,
          borderColor: COLORS.border,
        }}
      />

      {/* PAYMENT CONTROLS */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1.25fr 1fr",
            lg: "1.35fr 1fr 0.9fr auto",
          },
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* DISCOUNT */}

        <Box>
          <Typography
            sx={{
              mb: 0.6,
              fontSize: 11.5,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Apply Discount
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <RadioGroup
              row
              value={discountType}
              onChange={(event) => {
                setDiscountType(
                  event.target.value
                );
                setDiscountValue(0);
              }}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: 12,
                  color: COLORS.secondary,
                },

                "& .MuiRadio-root": {
                  color: COLORS.border,
                  py: 0.5,

                  "&.Mui-checked": {
                    color: COLORS.primary,
                  },
                },
              }}
            >
              <FormControlLabel
                value="percentage"
                control={
                  <Radio size="small" />
                }
                label="%"
              />

              <FormControlLabel
                value="fixed"
                control={
                  <Radio size="small" />
                }
                label="Rs."
              />
            </RadioGroup>

            <TextField
              size="small"
              type="number"
              value={discountValue}
              onChange={handleDiscountChange}
              placeholder="0"
              sx={{
                width: 105,

                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },

                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: COLORS.primary,
                  },

                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: COLORS.primary,
                    borderWidth: 1.5,
                  },
              }}
              inputProps={{
                min: 0,
                max:
                  discountType ===
                  "percentage"
                    ? 100
                    : subtotal,
                step: "0.01",
              }}
            />
          </Stack>
        </Box>

        {/* PAID */}

        <TextField
          fullWidth
          size="small"
          label="Paid Amount"
          type="number"
          value={paidAmount}
          onChange={handlePaidChange}
          placeholder="Enter amount"
          inputProps={{
            min: 0,
            max: grandTotal,
            step: "0.01",
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
            },

            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
              {
                borderColor: COLORS.primary,
              },

            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: COLORS.primary,
                borderWidth: 1.5,
              },
          }}
        />

        {/* DUE */}

        <Box
          sx={{
            minHeight: 40,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 10.5,
              color: COLORS.secondary,
            }}
          >
            Due Amount
          </Typography>

          <Typography
            sx={{
              mt: 0.2,
              fontSize: 16,
              fontWeight: 800,
              color:
                due === 0
                  ? "#047857"
                  : "#DC2626",
            }}
          >
            Rs. {due.toFixed(2)}
          </Typography>
        </Box>

        {/* ACTIONS */}

        <Stack
          direction="row"
          spacing={1}
          justifyContent={{
            xs: "stretch",
            lg: "flex-end",
          }}
          sx={{
            width: {
              xs: "100%",
              lg: "auto",
            },
          }}
        >
          <Button
            variant="outlined"
            startIcon={
              <CancelRoundedIcon />
            }
            disabled={cart.length === 0}
            onClick={onCancel}
            sx={{
              minWidth: {
                xs: 0,
                lg: 105,
              },
              flex: {
                xs: 1,
                lg: "initial",
              },
              height: 40,
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: 12.5,
              fontWeight: 700,
              borderColor: "#FECACA",
              color: "#DC2626",

              "&:hover": {
                borderColor: "#FCA5A5",
                backgroundColor: "#FEF2F2",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={
              <CheckCircleRoundedIcon />
            }
            disabled={cart.length === 0}
            onClick={onFinalize}
            sx={{
              minWidth: {
                xs: 0,
                lg: 125,
              },
              flex: {
                xs: 1,
                lg: "initial",
              },
              height: 40,
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: 12.5,
              fontWeight: 700,
              backgroundColor: COLORS.primary,
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#4338CA",
                boxShadow: "none",
              },
            }}
          >
            Finalize
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

export default InvoiceSummary;