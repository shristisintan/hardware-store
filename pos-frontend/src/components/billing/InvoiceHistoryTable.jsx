
import { useMemo, useState } from "react";

import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";

import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

import BillingViewDialog from "./BillingViewDialog";

// ===============================
// GLOBAL COLORS
// ===============================
const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  text: "#0F172A",
  secondary: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

// ===============================
// COMPONENT
// ===============================
function InvoiceHistoryTable({
  invoices = [],
  onRefresh,
}) {
  // ===============================
  // PAGINATION
  // ===============================
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ===============================
  // VIEW INVOICE DIALOG
  // ===============================
  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState(null);

  const [dialogOpen, setDialogOpen] =
    useState(false);

  // ===============================
  // PAGINATED DATA
  // ===============================
  const paginatedInvoices = useMemo(() => {
    const start = page * rowsPerPage;

    return invoices.slice(
      start,
      start + rowsPerPage
    );
  }, [invoices, page, rowsPerPage]);

  // ===============================
  // PAGE CHANGE
  // ===============================
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  // ===============================
  // ROWS PER PAGE
  // ===============================
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(
      parseInt(event.target.value, 10)
    );

    setPage(0);
  };

  // ===============================
  // VIEW INVOICE
  // ===============================
  const handleView = (invoice) => {
    setSelectedInvoiceId(invoice.id);
    setDialogOpen(true);
  };

  // ===============================
  // CLOSE DIALOG
  // ===============================
  const handleClose = () => {
    setDialogOpen(false);
    setSelectedInvoiceId(null);
  };

  // ===============================
  // STATUS STYLE
  // ===============================
  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return {
          color: "#15803D",
          background: "#F0FDF4",
        };

      case "PARTIAL":
        return {
          color: "#B45309",
          background: "#FFFBEB",
        };

      case "CREDIT":
        return {
          color: "#DC2626",
          background: "#FEF2F2",
        };

      default:
        return {
          color: COLORS.secondary,
          background: "#F8FAFC",
        };
    }
  };

  // ===============================
  // EMPTY STATE
  // ===============================
  if (invoices.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          minHeight: 350,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2.5,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
        }}
      >
        <ReceiptLongRoundedIcon
          sx={{
            fontSize: 52,
            color: "#CBD5E1",
            mb: 1.5,
          }}
        />

        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 650,
            color: COLORS.text,
          }}
        >
          No sales found
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: 12,
            color: COLORS.secondary,
          }}
        >
          Completed sales will appear here.
        </Typography>
      </Paper>
    );
  }

  // ===============================
  // TABLE
  // ===============================
  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.white,
          overflowX: "auto",
        }}
      >
        {/* ===============================
            TABLE HEADER
        =============================== */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Sales History
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: 11,
                color: COLORS.secondary,
              }}
            >
              {invoices.length} completed{" "}
              {invoices.length === 1
                ? "transaction"
                : "transactions"}
            </Typography>
          </Box>
        </Box>

        {/* ===============================
            TABLE
        =============================== */}
        <Table
          sx={{
            minWidth: 800,
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "#F8FAFC",
              }}
            >
              <TableCell
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.secondary,
                  textTransform: "uppercase",
                }}
              >
                Invoice
              </TableCell>

              <TableCell
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.secondary,
                  textTransform: "uppercase",
                }}
              >
                Customer
              </TableCell>

              <TableCell
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.secondary,
                  textTransform: "uppercase",
                }}
              >
                Date
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.secondary,
                  textTransform: "uppercase",
                }}
              >
                Total
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.secondary,
                  textTransform: "uppercase",
                }}
              >
                Status
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  width: 70,
                  fontSize: 11,
                  fontWeight: 700,
                  color: COLORS.secondary,
                  textTransform: "uppercase",
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedInvoices.map((invoice) => {
              const statusStyle =
                getStatusColor(
                  invoice.payment_status
                );

              return (
                <TableRow
                  key={invoice.id}
                  hover
                  sx={{
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  {/* ===============================
                      INVOICE
                  =============================== */}
                  <TableCell
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.primary,
                    }}
                  >
                    {invoice.invoice_no}
                  </TableCell>

                  {/* ===============================
                      CUSTOMER
                  =============================== */}
                  <TableCell>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: COLORS.text,
                      }}
                    >
                      {invoice.customer_name ||
                        "Walk-in Customer"}
                    </Typography>

                    {invoice.customer_phone && (
                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: 11,
                          color: COLORS.secondary,
                        }}
                      >
                        {invoice.customer_phone}
                      </Typography>
                    )}
                  </TableCell>

                  {/* ===============================
                      DATE
                  =============================== */}
                  <TableCell
                    sx={{
                      fontSize: 12,
                      color: COLORS.secondary,
                    }}
                  >
                    {new Date(
                      invoice.created_at
                    ).toLocaleDateString()}
                  </TableCell>

                  {/* ===============================
                      TOTAL
                  =============================== */}
                  <TableCell
                    align="right"
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: COLORS.text,
                    }}
                  >
                    Rs.{" "}
                    {Number(
                      invoice.grand_total || 0
                    ).toFixed(2)}
                  </TableCell>

                  {/* ===============================
                      STATUS
                  =============================== */}
                  <TableCell align="center">
                    <Chip
                      label={
                        invoice.payment_status ||
                        "CREDIT"
                      }
                      size="small"
                      sx={{
                        height: 25,
                        fontSize: 10,
                        fontWeight: 750,
                        color:
                          statusStyle.color,
                        backgroundColor:
                          statusStyle.background,
                        borderRadius: 1.5,
                      }}
                    />
                  </TableCell>

                  {/* ===============================
                      ACTION
                  =============================== */}
                  <TableCell align="center">
                    <Tooltip title="View invoice">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleView(invoice)
                        }
                        sx={{
                          width: 32,
                          height: 32,
                          color: COLORS.primary,
                          borderRadius: 1.5,
                          "&:hover": {
                            backgroundColor:
                              COLORS.primaryLight,
                          },
                        }}
                      >
                        <VisibilityRoundedIcon
                          sx={{
                            fontSize: 18,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* ===============================
            PAGINATION
        =============================== */}
        <TablePagination
          component="div"
          count={invoices.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={
            handleChangeRowsPerPage
          }
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            borderTop: `1px solid ${COLORS.border}`,

            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: 12,
                color: COLORS.secondary,
              },
          }}
        />
      </TableContainer>

      {/* ===============================
          INVOICE DETAILS DIALOG
      =============================== */}
      <BillingViewDialog
        open={dialogOpen}
        onClose={handleClose}
        invoiceId={selectedInvoiceId}
      />
    </>
  );
}

export default InvoiceHistoryTable;
