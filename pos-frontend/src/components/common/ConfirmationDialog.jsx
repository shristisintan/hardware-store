import {
Dialog,
DialogTitle,
DialogContent,
DialogContentText,
DialogActions,
Button,
CircularProgress,
Box,
} from "@mui/material";

function ConfirmationDialog({
open,
title = "Are you sure?",
message = "This action cannot be undone.",
confirmText = "Confirm",
cancelText = "Cancel",
confirmColor = "error",
loading = false,
onConfirm,
onClose,
}) {
const handleClose = () => {
if (!loading && onClose) {
onClose();
}
};

const handleConfirm = () => {
if (!loading && onConfirm) {
onConfirm();
}
};

return (
<Dialog
open={open}
onClose={handleClose}
maxWidth="xs"
fullWidth
PaperProps={{
sx: {
borderRadius: 2,
},
}}
>
<DialogTitle
sx={{
fontWeight: 700,
pb: 1,
}}
>
{title} </DialogTitle>
  <DialogContent>
    <DialogContentText
      sx={{
        color: "text.secondary",
        lineHeight: 1.6,
      }}
    >
      {message}
    </DialogContentText>
  </DialogContent>

  <DialogActions
    sx={{
      px: 3,
      pb: 3,
      pt: 1,
      gap: 1,
    }}
  >
    <Button
      variant="outlined"
      disabled={loading}
      onClick={handleClose}
    >
      {cancelText}
    </Button>

    <Button
      variant="contained"
      color={confirmColor}
      disabled={loading}
      onClick={handleConfirm}
      startIcon={
        loading ? (
          <CircularProgress
            size={16}
            color="inherit"
          />
        ) : null
      }
    >
      {loading ? "Please wait..." : confirmText}
    </Button>
  </DialogActions>
</Dialog>

);
}

export default ConfirmationDialog;
