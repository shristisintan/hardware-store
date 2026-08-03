import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { getInvoice } from "../../services/invoiceService";

function BillingViewDialog({ open, onClose, invoiceId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !invoiceId) {
      setData(null);
      return;
    }

    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getInvoice(invoiceId);

        setData(result);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load invoice details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [open, invoiceId]);

  const invoice = data?.invoice;
  const items = data?.items || [];

  const formatMoney = (value) =>
    `Rs. ${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "success";

      case "PARTIAL":
        return "warning";

      case "CREDIT":
        return "error";

      default:
        return "default";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 700,
              color: "#0F172A",
            }}
          >
            Invoice Details
          </Typography>

          {invoice && (
            <Typography
              sx={{
                fontSize: 14,
                color: "#64748B",
                mt: 0.5,
              }}
            >
              {invoice.invoice_no}
            </Typography>
          )}
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* LOADING */}
        {loading && (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* ERROR */}
        {!loading && error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* CONTENT */}
        {!loading && !error && invoice && (
          <Stack spacing={3}>
            {/* INVOICE INFO */}
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
              <Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748B",
                    mb: 0.5,
                  }}
                >
                  CUSTOMER
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {invoice.customer_name ||
                    "Walk-in Customer"}
                </Typography>

                {invoice.customer_phone && (
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "#64748B",
                      mt: 0.3,
                    }}
                  >
                    {invoice.customer_phone}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748B",
                    mb: 0.5,
                  }}
                >
                  DATE
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {formatDate(invoice.created_at)}
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748B",
                    mb: 0.5,
                  }}
                >
                  PAYMENT STATUS
                </Typography>

                <Chip
                  label={invoice.payment_status}
                  color={getStatusColor(
                    invoice.payment_status
                  )}
                  size="small"
                  sx={{
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#64748B",
                    mb: 0.5,
                  }}
                >
                  PREPARED BY
                </Typography>

                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0F172A",
                  }}
                >
                  {invoice.prepared_by || "-"}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* ITEMS */}
            <Box>
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0F172A",
                  mb: 1.5,
                }}
              >
                Items
              </Typography>

              <Box
                sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "#F7F7F5",
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        Product
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        Qty
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        Price
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#0F172A",
                        }}
                      >
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 600,
                            }}
                          >
                            {item.name}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          {item.quantity}
                        </TableCell>

                        <TableCell align="right">
                          {formatMoney(item.price)}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {formatMoney(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* SUMMARY */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Box
                sx={{
                  width: {
                    xs: "100%",
                    sm: 320,
                  },
                }}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography color="#64748B">
                      Subtotal
                    </Typography>

                    <Typography fontWeight={600}>
                      {formatMoney(
                        invoice.total_amount
                      )}
                    </Typography>
                  </Box>

                  {Number(
                    invoice.discount_amount || 0
                  ) > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography color="#64748B">
                        Discount
                      </Typography>

                      <Typography
                        sx={{
                          color: "#DC2626",
                          fontWeight: 600,
                        }}
                      >
                        -{" "}
                        {formatMoney(
                          invoice.discount_amount
                        )}
                      </Typography>
                    </Box>
                  )}

                  <Divider />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      Grand Total
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#4F46E5",
                      }}
                    >
                      {formatMoney(
                        invoice.grand_total
                      )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography color="#64748B">
                      Paid
                    </Typography>

                    <Typography fontWeight={600}>
                      {formatMoney(
                        invoice.paid_amount
                      )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography color="#64748B">
                      Due
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        color:
                          Number(
                            invoice.due_amount
                          ) > 0
                            ? "#DC2626"
                            : "#16A34A",
                      }}
                    >
                      {formatMoney(
                        invoice.due_amount
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BillingViewDialog;
