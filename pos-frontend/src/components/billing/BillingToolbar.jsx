import {
  Paper,
  Grid,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Box,
} from "@mui/material";

import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";

const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#EEF2FF",
  text: "#0F172A",
  secondary: "#64748B",
  background: "#F7F7F5",
  border: "#E2E8F0",
  white: "#FFFFFF",
};

function BillingToolbar({
  customers = [],
  products = [],
  selectedCustomer,
  setSelectedCustomer,
  selectedProduct,
  setSelectedProduct,
  sellingPrice,
  setSellingPrice,
  quantity,
  setQuantity,
  onAddItem,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        mb: 2,
        borderRadius: 2.5,
        border: `1px solid ${COLORS.border}`,
        backgroundColor: COLORS.white,
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 17,
              fontWeight: 700,
              color: COLORS.text,
              lineHeight: 1.3,
            }}
          >
            Create Invoice
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: 12.5,
              color: COLORS.secondary,
            }}
          >
            Select a customer and add products to this invoice.
          </Typography>
        </Box>

        <Box
          sx={{
            display: {
              xs: "none",
              sm: "flex",
            },
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 1.5,
            backgroundColor: COLORS.primaryLight,
            color: COLORS.primary,
            flexShrink: 0,
          }}
        >
          <AddShoppingCartRoundedIcon fontSize="small" />
        </Box>
      </Box>

      {/* INPUTS */}

      <Grid container spacing={1.5}>
        {/* CUSTOMER */}

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={customers}
            value={selectedCustomer}
            onChange={(event, value) => {
              setSelectedCustomer(value);
            }}
            getOptionLabel={(option) => option?.name || ""}
            isOptionEqualToValue={(option, value) =>
              Number(option?.id) === Number(value?.id)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Customer"
                placeholder="Select customer"
                fullWidth
                size="small"
              />
            )}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                backgroundColor: COLORS.white,
              },

              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: COLORS.primary,
                },

              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: COLORS.primary,
                  borderWidth: 1.5,
                },
            }}
          />
        </Grid>

        {/* PRODUCT */}

        <Grid size={{ xs: 12, md: 6 }}>
          <Autocomplete
            options={products}
            value={selectedProduct}
            onChange={(event, value) => {
              setSelectedProduct(value);

              if (value) {
                setSellingPrice("");
              } else {
                setSellingPrice("");
              }
            }}
            getOptionLabel={(option) => option?.name || ""}
            isOptionEqualToValue={(option, value) =>
              Number(option?.id) === Number(value?.id)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product"
                placeholder="Select product"
                fullWidth
                size="small"
              />
            )}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
                backgroundColor: COLORS.white,
              },

              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: COLORS.primary,
                },

              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: COLORS.primary,
                  borderWidth: 1.5,
                },
            }}
          />
        </Grid>

        {/* SELLING PRICE */}

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            label="Selling Price"
            type="number"
            value={sellingPrice}
            onChange={(event) => {
              setSellingPrice(event.target.value);
            }}
            placeholder="Enter price"
            inputProps={{
              min: 0,
              step: "0.01",
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },

              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: COLORS.primary,
                },

              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: COLORS.primary,
                  borderWidth: 1.5,
                },
            }}
          />
        </Grid>

        {/* QUANTITY */}

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(event) => {
              setQuantity(event.target.value);
            }}
            inputProps={{
              min: 1,
              step: 1,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },

              "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: COLORS.primary,
                },

              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: COLORS.primary,
                  borderWidth: 1.5,
                },
            }}
          />
        </Grid>

        {/* ADD ITEM */}

        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: {
                xs: "stretch",
                md: "flex-end",
              },
            }}
          >
            <Button
              variant="contained"
              startIcon={<AddShoppingCartRoundedIcon />}
              onClick={onAddItem}
              fullWidth
              sx={{
                height: 40,
                maxWidth: {
                  xs: "100%",
                  md: 220,
                },
                borderRadius: 1.5,
                textTransform: "none",
                fontSize: 13,
                fontWeight: 700,
                backgroundColor: COLORS.primary,
                boxShadow: "none",

                "&:hover": {
                  backgroundColor: "#4338CA",
                  boxShadow: "none",
                },
              }}
            >
              Add Item
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default BillingToolbar;