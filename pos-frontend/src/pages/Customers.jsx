import { useEffect, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/layout/DashboardLayout";

import CustomerToolbar from "../components/customers/CustomerToolbar";
import CustomerTable from "../components/customers/CustomerTable";
import AddCustomerDialog from "../components/customers/AddCustomerDialog";
import CustomerViewDialog from "../components/customers/CustomerViewDialog";

import { getCustomers } from "../services/customerService";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const data = await getCustomers();

      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [refreshKey]);

  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return true;

    return (
      String(customer.name || "")
        .toLowerCase()
        .includes(keyword) ||
      String(customer.phone || "")
        .toLowerCase()
        .includes(keyword) ||
      String(customer.address || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  const handleAdd = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleEdit = (customer) => {
    setEditData(customer);
    setOpen(true);
  };

  const handleView = (customer) => {
    setViewData(customer);
    setViewOpen(true);
  };

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <DashboardLayout
      title="Customers"
      subtitle="Manage your customers"
    >
      <Box
        sx={{
          width: "100%",
        }}
      >
        <CustomerToolbar
          search={search}
          onSearchChange={setSearch}
          onAddClick={handleAdd}
        />

        <Box
          sx={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              maxHeight: "calc(100vh - 245px)",
              minHeight: "420px",
              overflowY: "auto",
              overflowX: "auto",

              "&::-webkit-scrollbar": {
                width: "6px",
                height: "6px",
              },

              "&::-webkit-scrollbar-track": {
                background: "#F8FAFC",
              },

              "&::-webkit-scrollbar-thumb": {
                background: "#CBD5E1",
                borderRadius: "10px",
              },

              "&::-webkit-scrollbar-thumb:hover": {
                background: "#94A3B8",
              },
            }}
          >
            <CustomerTable
              customers={filteredCustomers}
              loading={loading}
              onEdit={handleEdit}
              onView={handleView}
              onDeleteSuccess={refreshData}
            />
          </Box>
        </Box>
      </Box>

      <AddCustomerDialog
        open={open}
        editData={editData}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          setEditData(null);
          refreshData();
        }}
      />

      <CustomerViewDialog
        open={viewOpen}
        data={viewData}
        onClose={() => {
          setViewOpen(false);
          setViewData(null);
        }}
      />
    </DashboardLayout>
  );
}

export default Customers;
