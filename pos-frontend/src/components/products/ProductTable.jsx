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

function getStatus(product) {

const stock =
Number(product.stock);

const threshold =
Number(product.low_stock_threshold ?? 10);

const limit =
Number(product.low_stock_limit ?? 5);

if (stock <= limit) {
return {
label: "Critical",
background: "#fef2f2",
color: "#dc2626",
};
}

if (stock <= threshold) {
return {
label: "Low Stock",
background: "#fffbeb",
color: "#d97706",
};
}

return {
label: "In Stock",
background: "#f0fdf4",
color: "#16a34a",
};
}

function ProductTable({
products,
onEdit,
onView,
onDeleteSuccess,
}) {

const [
deleteDialogOpen,
setDeleteDialogOpen,
] = useState(false);

const [
selectedProduct,
setSelectedProduct,
] = useState(null);

const [
deleting,
setDeleting,
] = useState(false);

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

  await deleteProduct(
    selectedProduct.id
  );

  closeDeleteDialog();

  onDeleteSuccess?.();

} catch (err) {

  console.error(
    "Delete failed:",
    err
  );

} finally {

  setDeleting(false);

}


};

if (!products.length) {

return (
  <Box
    sx={{
      textAlign: "center",
      py: 8,
      color: "#94a3b8",
    }}
  >
    No products found
  </Box>
);


}

return (
<> <TableContainer
     component={Paper}
     elevation={0}
   >


    <Table
      stickyHeader
      sx={{
        minWidth: 900,
      }}
    >

      <TableHead>

        <TableRow>

          {[
            "Product",
            "Category",
            "Stock",
            "Unit",
            "Purchase Price",
            "Status",
            "Actions",
          ].map((heading) => (

            <TableCell
              key={heading}
              align={
                heading === "Stock" ||
                heading === "Actions"
                  ? "center"
                  : "left"
              }
              sx={{
                backgroundColor:
                  "#f8fafc",

                color: "#475569",

                fontSize: "11px",

                fontWeight: 600,

                textTransform:
                  "uppercase",

                letterSpacing:
                  "0.4px",

                borderBottom:
                  "1px solid #e2e8f0",

                whiteSpace: "nowrap",
              }}
            >
              {heading}
            </TableCell>

          ))}

        </TableRow>

      </TableHead>


      <TableBody>

        {products.map((product) => {

          const status =
            getStatus(product);


          return (

            <TableRow
              key={product.id}
              hover
              sx={{
                "& td": {
                  borderBottom:
                    "1px solid #f1f5f9",
                },

                "&:last-child td": {
                  borderBottom: "none",
                },
              }}
            >

              <TableCell
                sx={{
                  color: "#0f172a",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                {product.name}
              </TableCell>


              <TableCell
                sx={{
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {product.category}
              </TableCell>


              <TableCell
                align="center"
                sx={{
                  color: "#334155",
                  fontWeight: 500,
                  fontSize: "13px",
                }}
              >
                {product.stock}
              </TableCell>


              <TableCell
                sx={{
                  color: "#64748b",
                  fontSize: "13px",
                }}
              >
                {product.unit}
              </TableCell>


              <TableCell
                sx={{
                  color: "#334155",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                Rs.{" "}
                {Number(
                  product.purchase_price
                ).toLocaleString(
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
                  size="small"
                  sx={{
                    backgroundColor:
                      status.background,

                    color:
                      status.color,

                    fontWeight: 600,

                    fontSize: "10px",

                    height: 25,

                    borderRadius: "6px",
                  }}
                />

              </TableCell>


              <TableCell align="center">

                <Tooltip title="View">

                  <IconButton
                    size="small"
                    onClick={() =>
                      onView(product)
                    }
                    sx={{
                      color: "#64748b",

                      "&:hover": {
                        backgroundColor:
                          "#eef2ff",

                        color:
                          "#4f46e5",
                      },
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>

                </Tooltip>


                <Tooltip title="Edit">

                  <IconButton
                    size="small"
                    onClick={() =>
                      onEdit(product)
                    }
                    sx={{
                      color: "#64748b",

                      "&:hover": {
                        backgroundColor:
                          "#eef2ff",

                        color:
                          "#4f46e5",
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>

                </Tooltip>


                <Tooltip title="Delete">

                  <IconButton
                    size="small"
                    onClick={() =>
                      openDeleteDialog(product)
                    }
                    sx={{
                      color: "#94a3b8",

                      "&:hover": {
                        backgroundColor:
                          "#fef2f2",

                        color:
                          "#dc2626",
                      },
                    }}
                  >
                    <Delete fontSize="small" />
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
        <strong>
          {selectedProduct?.name}
        </strong>
        ?
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
