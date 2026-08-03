import {
  Box,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";

function CustomerToolbar({
  search,
  onSearchChange,
  onAddClick,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1.5,
        mb: 2,
        flexWrap: "wrap",
      }}
    >
      <TextField
        placeholder="Search customers..."
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          width: {
            xs: "100%",
            sm: 280,
          },

          "& .MuiOutlinedInput-root": {
            height: 40,
            borderRadius: "9px",
            backgroundColor: "#FFFFFF",

            "& fieldset": {
              borderColor: "#E2E8F0",
            },

            "&:hover fieldset": {
              borderColor: "#CBD5E1",
            },

            "&.Mui-focused fieldset": {
              borderColor: "#4F46E5",
              borderWidth: "1px",
            },
          },

          "& .MuiInputBase-input": {
            fontSize: 13,
            color: "#0F172A",
          },

          "& .MuiInputBase-input::placeholder": {
            color: "#94A3B8",
            opacity: 1,
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: "#94A3B8",
                    fontSize: 20,
                  }}
                />
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddClick}
        sx={{
          height: 40,
          backgroundColor: "#4F46E5",
          color: "#FFFFFF",
          textTransform: "none",
          borderRadius: "9px",
          px: 2,
          fontWeight: 600,
          fontSize: 13,
          boxShadow: "none",

          "&:hover": {
            backgroundColor: "#4338CA",
            boxShadow: "none",
          },

          "&:active": {
            backgroundColor: "#3730A3",
          },
        }}
      >
        Add Customer
      </Button>
    </Box>
  );
}

export default CustomerToolbar;
