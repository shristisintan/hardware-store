import { useEffect, useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";

import DashboardLayout from "../components/layout/DashboardLayout";
import BillingToolbar from "../components/billing/BillingToolbar";
import BillingTable from "../components/billing/BillingTable";
import InvoiceSummary from "../components/billing/InvoiceSummary";

import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";

import {
  createInvoice,
  addInvoiceItem,
  getInvoice,
  applyDiscount,
  updatePayment,
  finalizeInvoice,
  cancelInvoice,
} from "../services/invoiceService";

const DRAFT_KEY = "billing_draft_invoice";

function Billing() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [invoiceId, setInvoiceId] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // IMPORTANT:
  // Keep selling price empty until the user enters it.
  const [sellingPrice, setSellingPrice] = useState("");

  const [quantity, setQuantity] = useState(1);

  // Keep discount empty instead of 0.
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");

  // Keep payment empty instead of 0.
  const [paidAmount, setPaidAmount] = useState("");

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showMessage = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeMessage = () => {
    setNotification((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const saveDraft = (id) => {
    localStorage.setItem(DRAFT_KEY, String(id));
  };

  const getDraft = () => {
    return localStorage.getItem(DRAFT_KEY);
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  const resetBilling = () => {
    setInvoiceId(null);
    setInvoice(null);
    setInvoiceItems([]);

    setSelectedCustomer(null);
    setSelectedProduct(null);

    // Reset to blank
    setSellingPrice("");
    setQuantity(1);

    setDiscountType("percentage");
    setDiscountValue("");

    setPaidAmount("");

    clearDraft();
  };

  const loadInvoice = async (id, customerList = customers) => {
    const data = await getInvoice(id);

    setInvoice(data.invoice || null);
    setInvoiceItems(data.items || []);

    if (data.invoice?.customer_id) {
      const customer = customerList.find(
        (item) =>
          Number(item.id) ===
          Number(data.invoice.customer_id)
      );

      setSelectedCustomer(customer || null);
    }

    // Keep blank when there is no payment
    if (
      data.invoice?.paid_amount !== null &&
      data.invoice?.paid_amount !== undefined &&
      Number(data.invoice.paid_amount) > 0
    ) {
      setPaidAmount(data.invoice.paid_amount);
    } else {
      setPaidAmount("");
    }

    const percentage = Number(
      data.invoice?.discount_percentage || 0
    );

    const amount = Number(
      data.invoice?.discount_amount || 0
    );

    if (percentage > 0) {
      setDiscountType("percentage");
      setDiscountValue(percentage);
    } else if (amount > 0) {
      setDiscountType("fixed");
      setDiscountValue(amount);
    } else {
      setDiscountType("percentage");
      setDiscountValue("");
    }

    return data;
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);

        const [customerData, productData] =
          await Promise.all([
            getCustomers(),
            getProducts(),
          ]);

        const customerList = Array.isArray(customerData)
          ? customerData
          : [];

        const productList = Array.isArray(productData)
          ? productData
          : [];

        setCustomers(customerList);
        setProducts(productList);

        const savedDraft = getDraft();

        if (savedDraft) {
          const draftId = Number(savedDraft);

          if (draftId > 0) {
            try {
              setInvoiceId(draftId);

              await loadInvoice(
                draftId,
                customerList
              );
            } catch (err) {
              console.error(
                "Saved draft could not be loaded:",
                err
              );

              clearDraft();
              resetBilling();
            }
          }
        }
      } catch (err) {
        console.error(err);

        showMessage(
          err.response?.data?.message ||
            "Unable to load billing data.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    const handleBillingError = (event) => {
      showMessage(
        event.detail ||
          "Something went wrong.",
        "error"
      );
    };

    window.addEventListener(
      "billing-error",
      handleBillingError
    );

    return () => {
      window.removeEventListener(
        "billing-error",
        handleBillingError
      );
    };
  }, []);

  const createDraftInvoice = async () => {
    if (!selectedCustomer) {
      showMessage(
        "Please select a customer.",
        "error"
      );

      return null;
    }

    if (invoiceId) {
      return invoiceId;
    }

    const data = await createInvoice(
      selectedCustomer.id
    );

    const newId = Number(
      data?.invoice_id
    );

    if (!newId) {
      throw new Error(
        "The server did not return a valid invoice ID."
      );
    }

    setInvoiceId(newId);
    saveDraft(newId);

    setInvoice({
      id: newId,
      customer_id:
        selectedCustomer.id,
      total_amount: 0,
      grand_total: 0,
      paid_amount: 0,
      due_amount: 0,
      payment_status: "CREDIT",
    });

    setInvoiceItems([]);

    return newId;
  };

  const handleAddItem = async () => {
    if (saving) return;

    if (!selectedCustomer) {
      showMessage(
        "Please select a customer.",
        "error"
      );

      return;
    }

    if (!selectedProduct) {
      showMessage(
        "Please select a product.",
        "error"
      );

      return;
    }

    const qty = Number(quantity);
    const price = Number(sellingPrice);

    if (
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      showMessage(
        "Quantity must be a positive whole number.",
        "error"
      );

      return;
    }

    // Empty selling price is not allowed
    if (
      sellingPrice === "" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      showMessage(
        "Please enter a selling price.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      const id =
        await createDraftInvoice();

      if (!id) return;

      await addInvoiceItem({
        invoice_id: id,
        product_id:
          selectedProduct.id,
        quantity: qty,
        selling_price: price,
      });

      await loadInvoice(id);

      setSelectedProduct(null);

      // Clear price after adding
      setSellingPrice("");

      setQuantity(1);

      showMessage(
        "Item added successfully."
      );
    } catch (err) {
      console.error(err);

      showMessage(
        err.response?.data?.message ||
          "Unable to add item.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!invoiceId) return false;

    const value =
      discountValue === ""
        ? 0
        : Number(discountValue);

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      showMessage(
        "Discount must be a valid number.",
        "error"
      );

      return false;
    }

    if (
      discountType === "percentage" &&
      value > 100
    ) {
      showMessage(
        "Discount percentage cannot exceed 100%.",
        "error"
      );

      return false;
    }

    try {
      let discountAmount = 0;
      let discountPercentage = null;

      if (
        discountType ===
        "percentage"
      ) {
        discountPercentage = value;

        const subtotal =
          invoiceItems.reduce(
            (sum, item) =>
              sum +
              Number(item.total || 0),
            0
          );

        discountAmount =
          subtotal *
          (value / 100);
      } else {
        discountAmount = value;
      }

      await applyDiscount(
        invoiceId,
        discountAmount,
        discountPercentage
      );

      await loadInvoice(invoiceId);

      return true;
    } catch (err) {
      console.error(err);

      showMessage(
        err.response?.data?.message ||
          "Unable to apply discount.",
        "error"
      );

      return false;
    }
  };

  const handleUpdatePayment = async () => {
    if (!invoiceId) return false;

    // Blank payment means Rs. 0
    const amount =
      paidAmount === ""
        ? 0
        : Number(paidAmount);

    if (
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      showMessage(
        "Paid amount must be a valid number.",
        "error"
      );

      return false;
    }

    try {
      await updatePayment(
        invoiceId,
        amount
      );

      await loadInvoice(invoiceId);

      return true;
    } catch (err) {
      console.error(err);

      showMessage(
        err.response?.data?.message ||
          "Unable to update payment.",
        "error"
      );

      return false;
    }
  };

  const handleFinalize = async () => {
    if (saving) return;

    if (!invoiceId) {
      showMessage(
        "No invoice available.",
        "error"
      );

      return;
    }

    if (invoiceItems.length === 0) {
      showMessage(
        "Add at least one item before finalizing.",
        "error"
      );

      return;
    }

    try {
      setSaving(true);

      const discountUpdated =
        await handleApplyDiscount();

      if (!discountUpdated) return;

      const paymentUpdated =
        await handleUpdatePayment();

      if (!paymentUpdated) return;

      await finalizeInvoice(
        invoiceId
      );

      clearDraft();

      showMessage(
        "Invoice finalized successfully."
      );

      resetBilling();
    } catch (err) {
      console.error(err);

      showMessage(
        err.response?.data?.message ||
          "Unable to finalize invoice.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (
      saving ||
      !invoiceId
    ) {
      return;
    }

    try {
      setSaving(true);

      await cancelInvoice(
        invoiceId
      );

      resetBilling();

      showMessage(
        "Invoice cancelled and stock restored."
      );
    } catch (err) {
      console.error(err);

      showMessage(
        err.response?.data?.message ||
          "Unable to cancel invoice.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DashboardLayout
        title="Billing"
        subtitle="Create invoices and manage customer payments"
      >
        <BillingToolbar
          customers={customers}
          products={products}
          selectedCustomer={
            selectedCustomer
          }
          setSelectedCustomer={
            setSelectedCustomer
          }
          selectedProduct={
            selectedProduct
          }
          setSelectedProduct={
            setSelectedProduct
          }
          sellingPrice={
            sellingPrice
          }
          setSellingPrice={
            setSellingPrice
          }
          quantity={quantity}
          setQuantity={setQuantity}
          onAddItem={
            handleAddItem
          }
        />

        <Box sx={{ width: "100%" }}>
          <BillingTable
            loading={loading}
            cart={invoiceItems}
            invoiceId={invoiceId}
            reloadInvoice={
              loadInvoice
            }
          />

          <InvoiceSummary
            cart={invoiceItems}
            invoice={invoice}
            paidAmount={paidAmount}
            setPaidAmount={
              setPaidAmount
            }
            discountType={
              discountType
            }
            setDiscountType={
              setDiscountType
            }
            discountValue={
              discountValue
            }
            setDiscountValue={
              setDiscountValue
            }
            onFinalize={
              handleFinalize
            }
            onCancel={
              handleCancel
            }
          />
        </Box>
      </DashboardLayout>

      <Snackbar
        open={notification.open}
        autoHideDuration={3500}
        onClose={closeMessage}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={closeMessage}
          severity={
            notification.severity
          }
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Billing;