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
  categories,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        mb: 4,
        flexWrap: "wrap",
      }}
    >
      {/* Left Side */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search products..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 320,
            background: "#fff",
            borderRadius: "12px",
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94A3B8" }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Category Filter */}
        <TextField
          select
          size="small"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{
            minWidth: 180,
            background: "#fff",
            borderRadius: "12px",
          }}
        >
          <MenuItem value="all">All Categories</MenuItem>

          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        {/* Stock Filter */}
        <TextField
          select
          size="small"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          sx={{
            minWidth: 170,
            background: "#fff",
            borderRadius: "12px",
          }}
        >
          <MenuItem value="all">All Stock</MenuItem>
          <MenuItem value="instock">In Stock</MenuItem>
          <MenuItem value="low">Low Stock</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
        </TextField>
      </Box>

      {/* Right Side */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClick}
        sx={{
          backgroundColor: "#173F35",
          textTransform: "none",
          borderRadius: "12px",
          px: 3,
          py: 1.2,
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "#215347",
          },
        }}
      >
        Add Product
      </Button>
    </Box>
  );
}

export default ProductToolbar;