import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Person,
  Inventory2,
  AddShoppingCart,
} from "@mui/icons-material";

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
  const selectedStock =
    selectedProduct?.stock !== undefined &&
    selectedProduct?.stock !== null
      ? Number(selectedProduct.stock)
      : null;

  const numericQuantity = Number(quantity);

  const remainingAfterAdd =
    selectedStock !== null &&
    Number.isInteger(numericQuantity) &&
    numericQuantity > 0
      ? selectedStock - numericQuantity
      : selectedStock;

  const getStockColor = (stock) => {
    if (stock === null || stock === undefined) {
      return "default";
    }

    if (stock <= 0) {
      return "error";
    }

    if (
      selectedProduct?.low_stock_limit !== undefined &&
      stock <= Number(selectedProduct.low_stock_limit)
    ) {
      return "error";
    }

    if (
      selectedProduct?.low_stock_threshold !== undefined &&
      stock <= Number(selectedProduct.low_stock_threshold)
    ) {
      return "warning";
    }

    return "success";
  };

  const stockColor = getStockColor(selectedStock);

  return (
    <Box
      sx={{
        width: "100%",
        mb: 2,
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={1.5}
        alignItems={{
          xs: "stretch",
          md: "center",
        }}
      >
        {/* ============================
            CUSTOMER
        ============================ */}
        <Autocomplete
          options={customers}
          value={selectedCustomer || null}
          onChange={(_, value) => {
            setSelectedCustomer(value);
          }}
          getOptionLabel={(option) =>
            option?.name || ""
          }
          isOptionEqualToValue={(option, value) =>
            Number(option?.id) === Number(value?.id)
          }
          fullWidth
          sx={{
            flex: 1,
            minWidth: {
              md: 220,
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Customer"
              placeholder="Select customer"
              size="small"
              required
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <Person
                      sx={{
                        ml: 1,
                        mr: 0.5,
                        color: "text.secondary",
                        fontSize: 20,
                      }}
                    />

                    {params.InputProps?.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        {/* ============================
            PRODUCT
        ============================ */}
        <Autocomplete
          options={products}
          value={selectedProduct || null}
          onChange={(_, value) => {
            setSelectedProduct(value);

            // Do not automatically put purchase price
            // into selling price.
            setSellingPrice("");
          }}
          getOptionLabel={(option) =>
            option?.name || ""
          }
          isOptionEqualToValue={(option, value) =>
            Number(option?.id) === Number(value?.id)
          }
          fullWidth
          sx={{
            flex: 1,
            minWidth: {
              md: 220,
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product"
              placeholder="Select product"
              size="small"
              required
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <Inventory2
                      sx={{
                        ml: 1,
                        mr: 0.5,
                        color: "text.secondary",
                        fontSize: 20,
                      }}
                    />

                    {params.InputProps?.startAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        {/* ============================
            STOCK
        ============================ */}
        {selectedProduct && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              minWidth: {
                md: "auto",
              },
              whiteSpace: "nowrap",
            }}
          >
            <Chip
              icon={<Inventory2 />}
              label={
                selectedStock === null
                  ? "Stock unavailable"
                  : `Stock: ${selectedStock}`
              }
              color={stockColor}
              variant="outlined"
              size="small"
            />

            {selectedStock !== null &&
              Number.isInteger(numericQuantity) &&
              numericQuantity > 0 && (
                <Chip
                  label={
                    remainingAfterAdd < 0
                      ? `Insufficient stock`
                      : `After: ${remainingAfterAdd}`
                  }
                  color={
                    remainingAfterAdd < 0
                      ? "error"
                      : "default"
                  }
                  size="small"
                />
              )}
          </Stack>
        )}

        {/* ============================
            QUANTITY
        ============================ */}
        <TextField
          label="Qty"
          type="number"
          size="small"
          value={quantity}
          onChange={(e) => {
            const value = e.target.value;

            if (value === "") {
              setQuantity("");
              return;
            }

            const numericValue = Number(value);

            if (
              Number.isInteger(numericValue) &&
              numericValue >= 0
            ) {
              setQuantity(numericValue);
            }
          }}
          inputProps={{
            min: 1,
            step: 1,
          }}
          sx={{
            width: {
              xs: "100%",
              md: 90,
            },
          }}
        />

        {/* ============================
            SELLING PRICE
        ============================ */}
        <TextField
          label="Selling Price"
          type="number"
          size="small"
          value={sellingPrice}
          onChange={(e) => {
            const value = e.target.value;

            // Allow empty input
            if (value === "") {
              setSellingPrice("");
              return;
            }

            // Allow only up to 2 decimal places
            if (
              /^\d*(\.\d{0,2})?$/.test(value)
            ) {
              setSellingPrice(value);
            }
          }}
          inputProps={{
            min: 0,
            step: "0.01",
          }}
          sx={{
            width: {
              xs: "100%",
              md: 145,
            },
          }}
        />

        {/* ============================
            ADD ITEM
        ============================ */}
        <Button
          variant="contained"
          startIcon={<AddShoppingCart />}
          onClick={onAddItem}
          sx={{
            minWidth: {
              xs: "100%",
              md: 145,
            },
            height: 40,
            whiteSpace: "nowrap",
          }}
        >
          Add Item
        </Button>
      </Stack>

      {/* ============================
          SELECTED PRODUCT INFO
      ============================ */}
      {selectedProduct && (
        <Box
          sx={{
            mt: 1,
            px: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Selected product:{" "}
            <strong>
              {selectedProduct.name}
            </strong>
            {selectedProduct.unit
              ? ` • Unit: ${selectedProduct.unit}`
              : ""}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default BillingToolbar;