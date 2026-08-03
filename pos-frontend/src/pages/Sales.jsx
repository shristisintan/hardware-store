import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";

import DashboardLayout from "../components/layout/DashboardLayout";
import InvoiceHistoryTable from "../components/billing/InvoiceHistoryTable";
import { getInvoices } from "../services/invoiceService";

const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  text: "#0F172A",
  secondary: "#64748B",
  background: "#F7F7F5",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

function Sales() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadInvoices = async () => {
    try {
      setLoading(true);

      const data = await getInvoices();

      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load sales:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  // Only finalized + non-cancelled invoices are actual sales.
  const sales = useMemo(() => {
    return invoices.filter(
      (invoice) =>
        Number(invoice.is_finalized) === 1 &&
        Number(invoice.is_cancelled) === 0
    );
  }, [invoices]);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sales;

    return sales.filter((invoice) => {
      const invoiceNo =
        invoice.invoice_no?.toLowerCase() || "";

      const customer =
        invoice.customer_name?.toLowerCase() || "";

      const phone =
        invoice.customer_phone?.toLowerCase() || "";

      return (
        invoiceNo.includes(query) ||
        customer.includes(query) ||
        phone.includes(query)
      );
    });
  }, [sales, search]);

  const summary = useMemo(() => {
    return sales.reduce(
      (result, invoice) => {
        const total = Number(invoice.grand_total || 0);
        const paid = Number(invoice.paid_amount || 0);
        const due = Number(invoice.due_amount || 0);

        result.totalSales += total;
        result.paid += paid;
        result.due += due;

        return result;
      },
      {
        totalSales: 0,
        paid: 0,
        due: 0,
      }
    );
  }, [sales]);

  const cards = [
    {
      label: "Total Sales",
      value: `Rs. ${summary.totalSales.toFixed(2)}`,
      icon: <PointOfSaleRoundedIcon />,
    },
    {
      label: "Transactions",
      value: sales.length,
      icon: <ReceiptLongRoundedIcon />,
    },
    {
      label: "Paid",
      value: `Rs. ${summary.paid.toFixed(2)}`,
      icon: <PaymentsRoundedIcon />,
    },
    {
      label: "Due",
      value: `Rs. ${summary.due.toFixed(2)}`,
      icon: <AccountBalanceWalletRoundedIcon />,
    },
  ];

  return (
    <DashboardLayout>
      <Box
        sx={{
          minHeight: "100%",
          backgroundColor: COLORS.background,
          p: {
            xs: 2,
            md: 3,
          },
        }}
      >
        {/* HEADER */}

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: {
                xs: 22,
                md: 26,
              },
              fontWeight: 750,
              color: COLORS.text,
            }}
          >
            Sales
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: COLORS.secondary,
            }}
          >
            View and manage completed sales transactions.
          </Typography>
        </Box>

        {/* SUMMARY CARDS */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              md: "repeat(4, 1fr)",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {cards.map((card) => (
            <Paper
              key={card.label}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.white,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  mb: 1.5,
                  borderRadius: 1.75,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: COLORS.primaryLight,
                  color: COLORS.primary,
                }}
              >
                {card.icon}
              </Box>

              <Typography
                sx={{
                  fontSize: 11,
                  color: COLORS.secondary,
                  mb: 0.5,
                }}
              >
                {card.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 15,
                    md: 18,
                  },
                  fontWeight: 750,
                  color: COLORS.text,
                }}
              >
                {card.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* SEARCH */}

        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2.5,
            border: `1px solid ${COLORS.border}`,
            backgroundColor: COLORS.white,
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search invoice number, customer or phone..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    sx={{
                      color: COLORS.secondary,
                      fontSize: 21,
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: COLORS.white,
              },
            }}
          />
        </Paper>

        {/* TABLE */}

        {loading ? (
          <Paper
            elevation={0}
            sx={{
              minHeight: 350,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2.5,
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
            }}
          >
            <CircularProgress
              size={30}
              sx={{
                color: COLORS.primary,
              }}
            />
          </Paper>
        ) : (
          <InvoiceHistoryTable
            invoices={filteredSales}
            onRefresh={loadInvoices}
          />
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Sales;
