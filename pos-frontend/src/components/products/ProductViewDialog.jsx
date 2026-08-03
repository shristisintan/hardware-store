import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  Stack,
} from "@mui/material";

function getStatus(product) {
  const stock = Number(product.stock);
  const threshold = Number(product.low_stock_threshold ?? 10);
  const limit = Number(product.low_stock_limit ?? 5);

  if (stock <= limit) {
    return { label: "Critical", color: "error" };
  }

  if (stock <= threshold) {
    return { label: "Low Stock", color: "warning" };
  }

  return { label: "In Stock", color: "success" };
}

function ProductViewDialog({ open, onClose, data }) {
  if (!data) return null;

  const status = getStatus(data);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Product Details</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Name
          </Typography>
          <Typography sx={{ mb: 1 }}>{data.name}</Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Category
          </Typography>
          <Typography sx={{ mb: 1 }}>{data.category}</Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Purchase Price
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Rs.{" "}
            {Number(data.purchase_price).toLocaleString("en-NP", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Current Stock
          </Typography>
          <Typography sx={{ mb: 1 }}>
            {data.stock} {data.unit}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Status
          </Typography>

          <Stack direction="row" sx={{ mt: 1, mb: 1 }}>
            <Chip
              label={status.label}
              color={status.color}
              size="small"
            />
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Low Stock Threshold
          </Typography>
          <Typography sx={{ mb: 1 }}>
            {data.low_stock_threshold}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Critical Stock Limit
          </Typography>
          <Typography>
            {data.low_stock_limit}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ProductViewDialog;