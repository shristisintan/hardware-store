import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from "@mui/material";

function ProductViewDialog({ open, onClose, data }) {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      
      <DialogTitle>
        Product Details
      </DialogTitle>

      <DialogContent>

        <Box sx={{ mt: 1 }}>

          <Typography variant="subtitle2" color="text.secondary">
            Name
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {data.name}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Category
          </Typography>
          <Typography sx={{ mb: 1 }}>
            {data.category}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Purchase Price
          </Typography>
          <Typography sx={{ mb: 1 }}>
            Rs. {data.purchase_price}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Stock
          </Typography>
          <Typography sx={{ mb: 1 }}>
            {data.stock}
          </Typography>

          <Divider sx={{ my: 1 }} />

          <Typography variant="subtitle2" color="text.secondary">
            Unit
          </Typography>
          <Typography>
            {data.unit}
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