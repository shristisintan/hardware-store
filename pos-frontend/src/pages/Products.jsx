import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProductToolbar from "../components/products/ProductToolbar";
import ProductSummaryCards from "../components/products/ProductSummaryCards";
import ProductTable from "../components/products/ProductTable";
import AddProductDialog from "../components/products/AddProductDialog";
import ProductViewDialog from "../components/products/ProductViewDialog";

import { getProducts } from "../services/productService";

function Products() {
  // ===============================
  // PRODUCTS
  // ===============================
  const [products, setProducts] = useState([]);

  // ===============================
  // FILTERS
  // ===============================
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // ===============================
  // DIALOGS
  // ===============================
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  // ===============================
  // FETCH PRODUCTS
  // ===============================
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ===============================
  // DYNAMIC CATEGORIES
  // ===============================
  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category))].sort();
  }, [products]);

  // ===============================
  // FILTERED PRODUCTS
  // ===============================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || product.category === category;

      let matchesStock = true;

      switch (stockFilter) {
        case "instock":
          matchesStock = product.stock > 15;
          break;

        case "low":
          matchesStock = product.stock <= 15 && product.stock > 5;
          break;

        case "critical":
          matchesStock = product.stock <= 5;
          break;

        default:
          matchesStock = true;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, category, stockFilter]);

  // ===============================
  // HANDLERS
  // ===============================
  const handleAdd = () => {
    setEditData(null);
    setOpen(true);
  };

  const handleEdit = (product) => {
    setEditData(product);
    setOpen(true);
  };

  const handleView = (product) => {
    setViewData(product);
    setViewOpen(true);
  };

  const refreshData = async () => {
    await fetchProducts();
  };

  return (
    <DashboardLayout
      title="Products"
      subtitle="Manage your inventory"
    >
      <ProductToolbar
        onAddClick={handleAdd}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        categories={categories}
      />

      <ProductSummaryCards
        products={products}
      />

      <Box
        sx={{
          maxHeight: "65vh",
          overflowY: "auto",
          overflowX: "auto",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff",
        }}
      >
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onView={handleView}
          onDeleteSuccess={refreshData}
        />
      </Box>

      <AddProductDialog
        open={open}
        onClose={() => setOpen(false)}
        editData={editData}
        onSuccess={() => {
          setOpen(false);
          refreshData();
        }}
      />

      <ProductViewDialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        data={viewData}
      />
    </DashboardLayout>
  );
}

export default Products;