import { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProductToolbar from "../components/products/ProductToolbar";
import ProductSummaryCards from "../components/products/ProductSummaryCards";
import ProductTable from "../components/products/ProductTable";
import AddProductDialog from "../components/products/AddProductDialog";
import ProductViewDialog from "../components/products/ProductViewDialog";

import { getProducts } from "../services/productService";

import "./Products.css";

function getStockStatus(product) {
  const stock = Number(product.stock ?? 0);

  const threshold = Number(
    product.low_stock_threshold ?? 10
  );

  const limit = Number(
    product.low_stock_limit ?? 5
  );

  if (stock <= limit) {
    return "critical";
  }

  if (stock <= threshold) {
    return "low";
  }

  return "instock";
}

function Products() {
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

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

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch products:",
        err
      );

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
    return [
      ...new Set(
        products
          .map(
            (product) =>
              product.category
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [products]);

  // ===============================
  // FILTER PRODUCTS
  // ===============================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = String(
        product.name || ""
      ).toLowerCase();

      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        productName.includes(
          searchValue
        );

      const matchesCategory =
        category === "all" ||
        product.category === category;

      const status =
        getStockStatus(product);

      const matchesStock =
        stockFilter === "all" ||
        status === stockFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock
      );
    });
  }, [
    products,
    search,
    category,
    stockFilter,
  ]);

  // ===============================
  // ADD PRODUCT
  // ===============================

  const handleAdd = () => {
    setEditData(null);
    setOpen(true);
  };

  // ===============================
  // EDIT PRODUCT
  // ===============================

  const handleEdit = (product) => {
    setEditData(product);
    setOpen(true);
  };

  // ===============================
  // VIEW PRODUCT
  // ===============================

  const handleView = (product) => {
    setViewData(product);
    setViewOpen(true);
  };

  // ===============================
  // REFRESH
  // ===============================

  const refreshData = async () => {
    await fetchProducts();
  };

  return (
    <DashboardLayout
      title="Products"
      subtitle="Manage products, stock levels and pricing."
    >
      <div className="products-page">

        {/* ===============================
            SUMMARY
        =============================== */}

        <ProductSummaryCards
          products={products}
        />

        {/* ===============================
            TOOLBAR
        =============================== */}

        <div className="products-toolbar-container">

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

        </div>

        {/* ===============================
            PRODUCT TABLE
        =============================== */}

        <div className="products-table-container">

          <Box
            sx={{
              width: "100%",
              maxHeight:
                "calc(100vh - 330px)",
              minHeight: "420px",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >

            <ProductTable
              products={filteredProducts}
              onEdit={handleEdit}
              onView={handleView}
              onDeleteSuccess={
                refreshData
              }
            />

          </Box>

        </div>

        {/* ===============================
            ADD / EDIT
        =============================== */}

        <AddProductDialog
          open={open}
          onClose={() =>
            setOpen(false)
          }
          editData={editData}
          onSuccess={() => {
            setOpen(false);
            refreshData();
          }}
        />

        {/* ===============================
            VIEW
        =============================== */}

        <ProductViewDialog
          open={viewOpen}
          onClose={() =>
            setViewOpen(false)
          }
          data={viewData}
        />

      </div>
    </DashboardLayout>
  );
}

export default Products;