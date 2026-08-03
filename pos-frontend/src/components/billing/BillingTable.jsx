import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from "@mui/material";

import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import { deleteInvoiceItem } from "../../services/invoiceService";

const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  text: "#0F172A",
  secondary: "#64748B",
  background: "#F7F7F5",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

function BillingTable({
  loading,
  cart = [],
  invoiceId,
  reloadInvoice,
}) {
  const handleDelete = async (item) => {
    if (!item?.id) return;

    try {
      await deleteInvoiceItem(item.id);

      if (invoiceId && reloadInvoice) {
        await reloadInvoice(invoiceId);
      }
    } catch (err) {
      console.error(err);

      window.dispatchEvent(
        new CustomEvent("billing-error", {
          detail:
            err.response?.data?.message ||
            "Unable to remove item.",
        })
      );
    }
  };

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 2.5,
          backgroundColor: COLORS.white,
        }}
      >
        <CircularProgress
          size={28}
          thickness={4}
          sx={{
            color: COLORS.primary,
          }}
        />
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: 2.5,
        overflow: "hidden",
        backgroundColor: COLORS.white,
      }}
    >
      {/* TABLE HEADER */}

      <Box
        sx={{
          px: { xs: 1.75, md: 2 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Invoice Items
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 11.5,
              color: COLORS.secondary,
            }}
          >
            Products currently added to this invoice
          </Typography>
        </Box>

        <Box
          sx={{
            px: 1.1,
            py: 0.55,
            borderRadius: 1.25,
            backgroundColor: COLORS.primaryLight,
            color: COLORS.primary,
          }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {cart.length}{" "}
            {cart.length === 1 ? "item" : "items"}
          </Typography>
        </Box>
      </Box>

      {/* TABLE */}

      <Table
        sx={{
          minWidth: 650,
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: COLORS.background,
            }}
          >
            <TableCell
              sx={{
                py: 1.2,
                fontSize: 10.5,
                fontWeight: 700,
                color: COLORS.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              Product
            </TableCell>

            <TableCell
              align="right"
              sx={{
                py: 1.2,
                fontSize: 10.5,
                fontWeight: 700,
                color: COLORS.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              Price
            </TableCell>

            <TableCell
              align="center"
              sx={{
                py: 1.2,
                fontSize: 10.5,
                fontWeight: 700,
                color: COLORS.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              Qty
            </TableCell>

            <TableCell
              align="right"
              sx={{
                py: 1.2,
                fontSize: 10.5,
                fontWeight: 700,
                color: COLORS.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              Total
            </TableCell>

            <TableCell
              align="center"
              sx={{
                width: 60,
                py: 1.2,
                fontSize: 10.5,
                fontWeight: 700,
                color: COLORS.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.4,
                borderBottom: `1px solid ${COLORS.border}`,
              }}
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {cart.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                sx={{
                  borderBottom: "none",
                }}
              >
                <Box
                  sx={{
                    py: 6,
                    px: 3,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      mx: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 2,
                      backgroundColor: COLORS.primaryLight,
                      color: COLORS.primary,
                    }}
                  >
                    <ReceiptLongRoundedIcon
                      sx={{
                        fontSize: 25,
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      mt: 1.5,
                      fontSize: 14,
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    No items added
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 12,
                      color: COLORS.secondary,
                      maxWidth: 340,
                      mx: "auto",
                      lineHeight: 1.5,
                    }}
                  >
                    Select a product above, enter the
                    selling price and quantity, then add
                    it to the invoice.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            cart.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{
                  transition: "background-color 0.15s ease",

                  "&:hover": {
                    backgroundColor: "#FAFAFF",
                  },

                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >
                {/* PRODUCT */}

                <TableCell
                  sx={{
                    py: 1.5,
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.text,
                  }}
                >
                  {item.name}
                </TableCell>

                {/* PRICE */}

                <TableCell
                  align="right"
                  sx={{
                    py: 1.5,
                    fontSize: 13,
                    color: COLORS.secondary,
                  }}
                >
                  Rs.{" "}
                  {Number(item.price || 0).toFixed(2)}
                </TableCell>

                {/* QUANTITY */}

                <TableCell
                  align="center"
                  sx={{
                    py: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      minWidth: 32,
                      height: 26,
                      px: 0.75,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                      backgroundColor: COLORS.background,
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {item.quantity}
                  </Box>
                </TableCell>

                {/* TOTAL */}

                <TableCell
                  align="right"
                  sx={{
                    py: 1.5,
                    fontSize: 13,
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  Rs.{" "}
                  {Number(item.total || 0).toFixed(2)}
                </TableCell>

                {/* DELETE */}

                <TableCell
                  align="center"
                  sx={{
                    py: 1.5,
                  }}
                >
                  <Tooltip title="Remove item">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(item)}
                      sx={{
                        width: 30,
                        height: 30,
                        color: "#DC2626",
                        borderRadius: 1.5,

                        "&:hover": {
                          backgroundColor: "#FEF2F2",
                        },
                      }}
                    >
                      <DeleteOutlineRoundedIcon
                        sx={{
                          fontSize: 18,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default BillingTable;