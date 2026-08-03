import { useState } from "react";
import { deleteCustomer } from "../../services/customerService";

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
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Avatar,
  Typography,
} from "@mui/material";

import {
  Visibility,
  Edit,
  Delete,
  Person,
} from "@mui/icons-material";

function CustomerTable({
  customers,
  loading,
  onView,
  onEdit,
  onDeleteSuccess,
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedCustomer) return;

    setDeleting(true);

    try {
      await deleteCustomer(selectedCustomer.id);

      setDeleteDialogOpen(false);
      setSelectedCustomer(null);

      onDeleteSuccess?.();
    } catch (err) {
      console.error("Failed to delete customer:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress
          size={28}
          sx={{
            color: "#4F46E5",
          }}
        />
      </Box>
    );
  }

  if (!customers.length) {
    return (
      <Box
        sx={{
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Avatar
          sx={{
            width: 48,
            height: 48,
            mb: 0.5,
            backgroundColor: "#EEF2FF",
            color: "#4F46E5",
          }}
        >
          <Person sx={{ fontSize: 24 }} />
        </Avatar>

        <Typography
          sx={{
            color: "#334155",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          No customers found
        </Typography>

        <Typography
          sx={{
            color: "#94A3B8",
            fontSize: 12,
          }}
        >
          Try changing your search.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "none",
          borderRadius: 0,
          overflowX: "auto",
        }}
      >
        <Table
          stickyHeader
          sx={{
            minWidth: 760,
          }}
        >
          <TableHead>
            <TableRow>
              {[
                "Customer",
                "Phone",
                "Address",
                "Joined",
              ].map((heading) => (
                <TableCell
                  key={heading}
                  sx={{
                    backgroundColor: "#F8FAFC",
                    color: "#64748B",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    py: 1.5,
                    px: 2,
                    borderBottom: "1px solid #E2E8F0",
                  }}
                >
                  {heading}
                </TableCell>
              ))}

              <TableCell
                align="right"
                sx={{
                  backgroundColor: "#F8FAFC",
                  color: "#64748B",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  py: 1.5,
                  px: 2,
                  borderBottom: "1px solid #E2E8F0",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {customers.map((customer) => (
              <TableRow
                key={customer.id}
                hover
                sx={{
                  "&:last-child td": {
                    borderBottom: 0,
                  },

                  "&:hover": {
                    backgroundColor: "#F8FAFC",
                  },
                }}
              >
                <TableCell
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        backgroundColor: "#EEF2FF",
                        color: "#4F46E5",
                      }}
                    >
                      {customer.name
                        ?.charAt(0)
                        ?.toUpperCase() || (
                        <Person sx={{ fontSize: 19 }} />
                      )}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0F172A",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 220,
                        }}
                      >
                        {customer.name}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#94A3B8",
                          mt: 0.2,
                        }}
                      >
                        Customer #{customer.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell
                  sx={{
                    py: 1.5,
                    px: 2,
                    color: "#475569",
                    fontSize: 13,
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  {customer.phone || "-"}
                </TableCell>

                <TableCell
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#475569",
                      fontSize: 13,
                      maxWidth: 250,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={customer.address || ""}
                  >
                    {customer.address || "-"}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={{
                    py: 1.5,
                    px: 2,
                    color: "#64748B",
                    fontSize: 12,
                    borderBottom: "1px solid #F1F5F9",
                    whiteSpace: "nowrap",
                  }}
                >
                  {customer.created_at
                    ? new Date(
                        customer.created_at
                      ).toLocaleDateString("en-NP")
                    : "-"}
                </TableCell>

                <TableCell
                  align="right"
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: "1px solid #F1F5F9",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Tooltip title="View customer">
                    <IconButton
                      size="small"
                      onClick={() => onView(customer)}
                      sx={{
                        width: 32,
                        height: 32,
                        color: "#64748B",

                        "&:hover": {
                          color: "#4F46E5",
                          backgroundColor: "#EEF2FF",
                        },
                      }}
                    >
                      <Visibility sx={{ fontSize: 19 }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Edit customer">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(customer)}
                      sx={{
                        width: 32,
                        height: 32,
                        color: "#64748B",

                        "&:hover": {
                          color: "#4F46E5",
                          backgroundColor: "#EEF2FF",
                        },
                      }}
                    >
                      <Edit sx={{ fontSize: 19 }} />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete customer">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setDeleteDialogOpen(true);
                      }}
                      sx={{
                        width: 32,
                        height: 32,
                        color: "#94A3B8",

                        "&:hover": {
                          color: "#DC2626",
                          backgroundColor: "#FEF2F2",
                        },
                      }}
                    >
                      <Delete sx={{ fontSize: 19 }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteDialogOpen(false);
            setSelectedCustomer(null);
          }
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "#0F172A",
          }}
        >
          Delete Customer
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            sx={{
              color: "#64748B",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to delete{" "}
            <strong style={{ color: "#0F172A" }}>
              {selectedCustomer?.name}
            </strong>
            ?
            <br />
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            disabled={deleting}
            onClick={() => {
              setDeleteDialogOpen(false);
              setSelectedCustomer(null);
            }}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              borderColor: "#E2E8F0",
              color: "#475569",

              "&:hover": {
                borderColor: "#CBD5E1",
                backgroundColor: "#F8FAFC",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={deleting}
            onClick={handleDelete}
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              backgroundColor: "#DC2626",
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#B91C1C",
                boxShadow: "none",
              },
            }}
          >
            {deleting ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CustomerTable;
