// ======================================
// DRAFT INVOICE STORAGE
// ======================================

const STORAGE_KEY = "currentDraftInvoice";

// Save current draft invoice
export const saveDraftInvoice = (invoiceId) => {
  if (!invoiceId) return;

  localStorage.setItem(
    STORAGE_KEY,
    String(invoiceId)
  );
};

// Get current draft invoice
export const getDraftInvoice = () => {
  return localStorage.getItem(STORAGE_KEY);
};

// Remove draft invoice
export const clearDraftInvoice = () => {
  localStorage.removeItem(STORAGE_KEY);
};