import { useState } from "react";
import { deleteProduct } from "../../services/productService";

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";

import {
  Visibility,
  Edit,
  Delete,
} from "@mui/icons-material";

import ConfirmDialog from "../common/ConfirmDialog";

function getStatus(stock) {
  if (stock <= 5) return { label: "Critical", color: "error" };
  if (stock <= 15) return { label: "Low Stock", color: "warning" };
  return { label: "In Stock", color: "success" };
}

function ProductTable({
  products,
  onEdit,
  onView,
  onDeleteSuccess,
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const openDeleteDialog = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;

    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setDeleting(true);

    try {
      await deleteProduct(selectedProduct.id);

      closeDeleteDialog();

      onDeleteSuccess?.();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (!products.length) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 5,
          color: "#94A3B8",
        }}
      >
        No products found
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: "18px",
          border: "1px solid #E5E7EB",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#F8FAFC" }}>
              <TableCell>
                <strong>Product</strong>
              </TableCell>

              <TableCell>
                <strong>Category</strong>
              </TableCell>

              <TableCell align="center">
                <strong>Stock</strong>
              </TableCell>

              <TableCell>
                <strong>Unit</strong>
              </TableCell>

              <TableCell>
                <strong>Purchase Price</strong>
              </TableCell>

              <TableCell>
                <strong>Status</strong>
              </TableCell>

              <TableCell align="center">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {products.map((product) => {
              const status = getStatus(product.stock);

              return (
                <TableRow key={product.id} hover>
                  <TableCell>{product.name}</TableCell>

                  <TableCell>{product.category}</TableCell>

                  <TableCell align="center">
                    {product.stock}
                  </TableCell>

                  <TableCell>{product.unit}</TableCell>

                  <TableCell>
                    Rs.{" "}
                    {Number(product.purchase_price).toLocaleString(
                      "en-NP",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Tooltip title="View">
                      <IconButton
                        color="primary"
                        onClick={() => onView(product)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        color="success"
                        onClick={() => onEdit(product)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => openDeleteDialog(product)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong>{selectedProduct?.name}</strong>?
            <br />
            <br />
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        confirmColor="error"
        loading={deleting}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default ProductTable;