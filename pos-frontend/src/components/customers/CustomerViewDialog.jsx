import { useEffect, useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";

import {
  Person,
  Phone,
  LocationOn,
  ReceiptLong,
  ShoppingBag,
  CalendarMonth,
  Close,
} from "@mui/icons-material";

import { getCustomerHistory } from "../../services/customerService";

const COLORS = {
  primary: "#4F46E5",
  primaryHover: "#4338CA",
  primaryDark: "#3730A3",

  primaryLight: "#EEF2FF",
  primaryBorder: "#C7D2FE",

  text: "#0F172A",
  secondary: "#64748B",
  muted: "#94A3B8",

  darkSecondary: "#475569",

  border: "#E2E8F0",
  lightBorder: "#F1F5F9",

  background: "#F8FAFC",
  white: "#FFFFFF",

  success: "#16A34A",
  successBg: "#F0FDF4",

  danger: "#DC2626",
  dangerBg: "#FEF2F2",
};

export default function CustomerViewDialog({
  open,
  onClose,
  data,
}) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !data?.id) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");
        setHistory(null);

        const result = await getCustomerHistory(data.id);

        setHistory(result);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load customer history."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open, data]);

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow:
            "0 20px 50px rgba(15, 23, 42, 0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 42,
                height: 42,
                backgroundColor: COLORS.primaryLight,
                color: COLORS.primary,
              }}
            >
              <Person />
            </Avatar>

            <Box>
              <Typography
                sx={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                Customer Details
              </Typography>

              {data?.name && (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: COLORS.secondary,
                    mt: 0.2,
                  }}
                >
                  {data.name}
                </Typography>
              )}
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            sx={{
              width: 34,
              height: 34,
              color: COLORS.muted,

              "&:hover": {
                backgroundColor: COLORS.background,
                color: COLORS.text,
              },
            }}
          >
            <Close sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 3,
          backgroundColor: COLORS.background,
        }}
      >
        {loading && (
          <Box
            sx={{
              minHeight: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress
              size={30}
              sx={{
                color: COLORS.primary,
              }}
            />
          </Box>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            sx={{
              borderRadius: "9px",
            }}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && history && (
          <>
            {/* CUSTOMER PROFILE */}

            <Box
              sx={{
                backgroundColor: COLORS.white,
                border: `1px solid ${COLORS.border}`,
                borderRadius: "10px",
                p: 2.5,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    backgroundColor: COLORS.primaryLight,
                    color: COLORS.primary,
                    fontSize: 22,
                    fontWeight: 700,
                  }}
                >
                  {history.customer.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </Avatar>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    {history.customer.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: COLORS.secondary,
                      mt: 0.3,
                    }}
                  >
                    Customer #{history.customer.id}
                  </Typography>
                </Box>
              </Box>

              <Divider
                sx={{
                  mb: 2.5,
                  borderColor: COLORS.lightBorder,
                }}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                <InfoItem
                  icon={<Phone sx={{ fontSize: 17 }} />}
                  label="Phone"
                  value={history.customer.phone || "-"}
                />

                <InfoItem
                  icon={
                    <LocationOn sx={{ fontSize: 17 }} />
                  }
                  label="Address"
                  value={history.customer.address || "-"}
                />

                <InfoItem
                  icon={
                    <CalendarMonth sx={{ fontSize: 17 }} />
                  }
                  label="Joined"
                  value={formatDate(
                    history.customer.created_at
                  )}
                />
              </Box>
            </Box>

            {/* SUMMARY */}

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.text,
                mb: 1.5,
              }}
            >
              Purchase Summary
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(3, 1fr)",
                },
                gap: 1.5,
                mb: 3,
              }}
            >
              <SummaryCard
                label="Total Purchases"
                value={`Rs. ${formatCurrency(
                  history.summary.total_purchases
                )}`}
                icon={
                  <ShoppingBag
                    sx={{
                      fontSize: 19,
                      color: COLORS.primary,
                    }}
                  />
                }
                valueColor={COLORS.primary}
              />

              <SummaryCard
                label="Total Invoices"
                value={history.summary.total_invoices}
                icon={
                  <ReceiptLong
                    sx={{
                      fontSize: 19,
                      color: COLORS.primary,
                    }}
                  />
                }
                valueColor={COLORS.text}
              />

              <SummaryCard
                label="Active Invoices"
                value={history.summary.active_invoices}
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: COLORS.success,
                    }}
                  />
                }
                valueColor={COLORS.success}
              />
            </Box>

            {/* PURCHASE HISTORY */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: COLORS.text,
                }}
              >
                Purchase History
              </Typography>

              {history.invoices.length > 0 && (
                <Typography
                  sx={{
                    fontSize: 11,
                    color: COLORS.secondary,
                  }}
                >
                  {history.invoices.length} invoice
                  {history.invoices.length !== 1
                    ? "s"
                    : ""}
                </Typography>
              )}
            </Box>

            {history.invoices.length === 0 ? (
              <Box
                sx={{
                  backgroundColor: COLORS.white,
                  border: `1px dashed ${COLORS.border}`,
                  borderRadius: "10px",
                  py: 5,
                  textAlign: "center",
                }}
              >
                <ReceiptLong
                  sx={{
                    fontSize: 38,
                    color: COLORS.muted,
                    mb: 1,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  No Purchase History
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: COLORS.secondary,
                    mt: 0.5,
                  }}
                >
                  This customer has not made any
                  purchases yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer
                sx={{
                  backgroundColor: COLORS.white,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: "10px",
                  overflowX: "auto",
                }}
              >
                <Table
                  size="small"
                  sx={{
                    minWidth: 600,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      {[
                        "Invoice",
                        "Date",
                        "Amount",
                        "Status",
                      ].map((heading, index) => (
                        <TableCell
                          key={heading}
                          align={
                            index === 2
                              ? "right"
                              : index === 3
                              ? "center"
                              : "left"
                          }
                          sx={{
                            backgroundColor:
                              COLORS.background,
                            color: COLORS.secondary,
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            borderBottom: `1px solid ${COLORS.border}`,
                            py: 1.4,
                          }}
                        >
                          {heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {history.invoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        hover
                        sx={{
                          "&:last-child td": {
                            borderBottom: 0,
                          },

                          "&:hover": {
                            backgroundColor: "#FAFAFC",
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: COLORS.primary,
                            borderBottom: `1px solid ${COLORS.lightBorder}`,
                            py: 1.5,
                          }}
                        >
                          {invoice.invoice_no}
                        </TableCell>

                        <TableCell
                          sx={{
                            fontSize: 12,
                            color: COLORS.secondary,
                            borderBottom: `1px solid ${COLORS.lightBorder}`,
                          }}
                        >
                          {formatDate(invoice.created_at)}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: COLORS.text,
                            borderBottom: `1px solid ${COLORS.lightBorder}`,
                          }}
                        >
                          Rs.{" "}
                          {formatCurrency(
                            invoice.grand_total
                          )}
                        </TableCell>

                        <TableCell
                          align="center"
                          sx={{
                            borderBottom: `1px solid ${COLORS.lightBorder}`,
                          }}
                        >
                          <Chip
                            size="small"
                            label={
                              invoice.is_cancelled
                                ? "Cancelled"
                                : "Completed"
                            }
                            sx={{
                              height: 24,
                              fontSize: 10,
                              fontWeight: 600,
                              backgroundColor:
                                invoice.is_cancelled
                                  ? COLORS.dangerBg
                                  : COLORS.successBg,
                              color:
                                invoice.is_cancelled
                                  ? COLORS.danger
                                  : COLORS.success,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 1.8,
          borderTop: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            px: 2.5,
            backgroundColor: COLORS.primary,
            boxShadow: "none",
            fontSize: 13,
            fontWeight: 600,

            "&:hover": {
              backgroundColor: COLORS.primaryHover,
              boxShadow: "none",
            },

            "&:active": {
              backgroundColor: COLORS.primaryDark,
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ===============================
   INFO ITEM
================================ */

function InfoItem({ icon, label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.2,
        alignItems: "flex-start",
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          backgroundColor: "#EEF2FF",
          color: "#4F46E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#0F172A",
            mt: 0.3,
            wordBreak: "break-word",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

/* ===============================
   SUMMARY CARD
================================ */

function SummaryCard({
  label,
  value,
  icon,
  valueColor,
}) {
  return (
    <Box
      sx={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "#64748B",
          }}
        >
          {label}
        </Typography>

        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 20,
          fontWeight: 700,
          color: valueColor,
          mt: 1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
