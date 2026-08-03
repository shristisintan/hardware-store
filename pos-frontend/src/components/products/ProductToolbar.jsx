
import {
  Box,
  Button,
  MenuItem,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

function ProductToolbar({
  onAddClick,
  search,
  setSearch,
  category,
  setCategory,
  stockFilter,
  setStockFilter,
  categories = [],
}) {
  return (
    <Box
      sx={{
        width: "100%",
        mb: 2,
        p: 1.5,
        boxSizing: "border-box",

        display: "flex",
        alignItems: "center",
        gap: 1.25,

        flexWrap: {
          xs: "wrap",
          md: "nowrap",
        },

        backgroundColor: "#FFFFFF",

        border: "1px solid #E2E8F0",
        borderRadius: 2.5,
      }}
    >
      {/* SEARCH */}

      <TextField
        placeholder="Search products..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          flex: 1,

          minWidth: {
            xs: "100%",
            md: 240,
          },

          "& .MuiOutlinedInput-root": {
            height: 40,
            borderRadius: 2,
            backgroundColor: "#F8FAFC",

            "& fieldset": {
              borderColor: "#E2E8F0",
            },

            "&:hover fieldset": {
              borderColor: "#CBD5E1",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#4F46E5",
            },
          },

          "& input": {
            fontSize: "13px",
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: "#94A3B8",
                    fontSize: 19,
                  }}
                />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* CATEGORY */}

      <TextField
        select
        size="small"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        sx={{
          width: {
            xs: "calc(50% - 6px)",
            md: 150,
          },

          "& .MuiOutlinedInput-root": {
            height: 40,
            borderRadius: 2,
            backgroundColor: "#F8FAFC",

            "& fieldset": {
              borderColor: "#E2E8F0",
            },

            "&:hover fieldset": {
              borderColor: "#CBD5E1",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#4F46E5",
            },
          },

          "& .MuiSelect-select": {
            fontSize: "13px",
          },
        }}
      >
        <MenuItem value="all">
          All Categories
        </MenuItem>

        {categories.map((cat) => (
          <MenuItem key={cat} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </TextField>

      {/* STOCK */}

      <TextField
        select
        size="small"
        value={stockFilter}
        onChange={(e) => setStockFilter(e.target.value)}
        sx={{
          width: {
            xs: "calc(50% - 6px)",
            md: 130,
          },

          "& .MuiOutlinedInput-root": {
            height: 40,
            borderRadius: 2,
            backgroundColor: "#F8FAFC",

            "& fieldset": {
              borderColor: "#E2E8F0",
            },

            "&:hover fieldset": {
              borderColor: "#CBD5E1",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#4F46E5",
            },
          },

          "& .MuiSelect-select": {
            fontSize: "13px",
          },
        }}
      >
        <MenuItem value="all">
          All Stock
        </MenuItem>

        <MenuItem value="instock">
          In Stock
        </MenuItem>

        <MenuItem value="low">
          Low Stock
        </MenuItem>

        <MenuItem value="critical">
          Critical
        </MenuItem>
      </TextField>

      {/* ADD PRODUCT */}

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClick}
        sx={{
          height: 40,
          minWidth: {
            xs: "100%",
            md: 135,
          },

          px: 2,

          borderRadius: 2,

          backgroundColor: "#4F46E5",

          textTransform: "none",

          fontWeight: 600,

          fontSize: "13px",

          boxShadow: "none",

          whiteSpace: "nowrap",

          "&:hover": {
            backgroundColor: "#4338CA",
            boxShadow: "none",
          },
        }}
      >
        Add Product
      </Button>
    </Box>
  );
}

export default ProductToolbar;