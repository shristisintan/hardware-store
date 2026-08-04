import { useState } from "react";

import {
Paper,
Table,
TableBody,
TableCell,
TableContainer,
TableHead,
TableRow,
IconButton,
Tooltip,
Typography,
Box,
CircularProgress,
} from "@mui/material";

import {
Delete,
} from "@mui/icons-material";

import {
deleteInvoiceItem,
} from "../../services/invoiceService";

import ConfirmationDialog from "../common/ConfirmationDialog";

function BillingTable({
loading,
cart = [],
invoiceId,
reloadInvoice,
}) {
const [deleteDialog, setDeleteDialog] = useState({
open: false,
itemId: null,
itemName: "",
});

const [deleting, setDeleting] = useState(false);

const openDeleteDialog = (item) => {
setDeleteDialog({
open: true,
itemId: item.id,
itemName:
item.name ||
item.product_name ||
"this item",
});
};

const closeDeleteDialog = () => {
if (deleting) return;

setDeleteDialog({
  open: false,
  itemId: null,
  itemName: "",
});

};

const handleConfirmDelete = async () => {
if (!deleteDialog.itemId || deleting) {
return;
}

try {
  setDeleting(true);

  await deleteInvoiceItem(
    deleteDialog.itemId
  );

  if (invoiceId && reloadInvoice) {
    await reloadInvoice(invoiceId);
  }

  closeDeleteDialog();
} catch (err) {
  console.error(
    "Failed to delete invoice item:",
    err
  );

  window.dispatchEvent(
    new CustomEvent("billing-error", {
      detail:
        err.response?.data?.message ||
        "Unable to remove invoice item.",
    })
  );
} finally {
  setDeleting(false);
}

};

return (
<>
<TableContainer
component={Paper}
elevation={0}
sx={{
width: "100%",
border: "1px solid",
borderColor: "divider",
borderRadius: 2,
overflowX: "auto",
}}
>
<Table
size="small"
sx={{
minWidth: 700,
}}
> <TableHead> <TableRow>
<TableCell
sx={{
fontWeight: 700,
}}
>
Product </TableCell>
          <TableCell
            align="center"
            sx={{
              fontWeight: 700,
            }}
          >
            Quantity
          </TableCell>

          <TableCell
            align="right"
            sx={{
              fontWeight: 700,
            }}
          >
            Selling Price
          </TableCell>

          <TableCell
            align="right"
            sx={{
              fontWeight: 700,
            }}
          >
            Total
          </TableCell>

          <TableCell
            align="center"
            sx={{
              fontWeight: 700,
              width: 70,
            }}
          >
            Action
          </TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={5}
              align="center"
              sx={{ py: 5 }}
            >
              <CircularProgress size={28} />
            </TableCell>
          </TableRow>
        ) : cart.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              align="center"
              sx={{ py: 5 }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
              >
                No products added to this invoice yet.
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          cart.map((item) => (
            <TableRow
              key={item.id}
              hover
            >
              <TableCell>
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  {item.name ||
                    item.product_name ||
                    "Unknown product"}
                </Typography>
              </TableCell>

              <TableCell align="center">
                {item.quantity}
              </TableCell>

              <TableCell align="right">
                Rs.{" "}
                {Number(
                  item.price ??
                    item.selling_price ??
                    0
                ).toFixed(2)}
              </TableCell>

              <TableCell align="right">
                <Typography fontWeight={600}>
                  Rs.{" "}
                  {Number(
                    item.total || 0
                  ).toFixed(2)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Remove item">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() =>
                      openDeleteDialog(item)
                    }
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>

  <ConfirmationDialog
    open={deleteDialog.open}
    title="Remove Invoice Item?"
    message={`Are you sure you want to remove "${deleteDialog.itemName}" from this invoice?`}
    confirmText="Remove"
    cancelText="Keep Item"
    confirmColor="error"
    loading={deleting}
    onConfirm={handleConfirmDelete}
    onClose={closeDeleteDialog}
  />
</>


);
}

export default BillingTable;
