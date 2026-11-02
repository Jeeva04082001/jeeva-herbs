import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowLeft, Plus, Trash2, Pencil, X } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";

const getToday = () => {
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
  );
  return localDate.toISOString().slice(0, 10);
};

const initialForm = {
  customer_id: "",
  product_id: "",
  variant_id: "",
  purchase_date: getToday(),
  quantity: 1,
  unit_price: "",
  notes: "",
};

function CustomerPurchasesPage() {
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [customerSearch, setCustomerSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const selectedCustomer =
    customers.find(
      (customer) => String(customer.id) === String(form.customer_id)
    ) || null;

  // Wait until the user pauses typing before filtering customers.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(customerSearch.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch]);

  const filteredCustomers = useMemo(() => {
    const search = debouncedSearch.toLowerCase();

    return customers.filter((customer) => {
      const name = String(
        customer.full_name || customer.name || ""
      ).toLowerCase();
      const phone = String(customer.phone || "");

      return name.includes(search) || phone.includes(search);
    });
  }, [customers, debouncedSearch]);

  const customerOptions =
    selectedCustomer &&
    !filteredCustomers.some(
      (customer) => String(customer.id) === String(selectedCustomer.id)
    )
      ? [selectedCustomer, ...filteredCustomers]
      : filteredCustomers;

  const selectedProduct =
    products.find(
      (product) => String(product.id) === String(form.product_id)
    ) || null;

  const selectedVariant =
    variants.find(
      (variant) => String(variant.id) === String(form.variant_id)
    ) || null;

  const currentItemTotal =
    Number(form.quantity || 0) * Number(form.unit_price || 0);

  const grandTotal = cartItems.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.unit_price),
    0
  );

  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  async function fetchInitialData() {
    try {
      setLoading(true);
      setError("");

      const [customerResponse, productResponse] = await Promise.all([
        api.get("/api/admin/customers"),
        api.get("/api/products"),
      ]);

      const customerData = customerResponse.data;
      const productData = productResponse.data;

      const normalizedCustomers = Array.isArray(customerData)
        ? customerData
        : customerData?.customers || [];
      const normalizedProducts = Array.isArray(productData)
        ? productData
        : productData?.products || [];

      setCustomers(normalizedCustomers);
      setProducts(normalizedProducts);

      // Restore the selected customer after refresh, then fetch persisted history.
      const savedCustomerId = localStorage.getItem(
        "adminCustomerPurchasesCustomerId"
      );
      const savedCustomer = normalizedCustomers.find(
        (customer) => String(customer.id) === String(savedCustomerId)
      );
      if (savedCustomer) {
        setForm((previous) => ({
          ...previous,
          customer_id: String(savedCustomer.id),
        }));
        setCustomerSearch(
          `${savedCustomer.full_name || savedCustomer.name || ""} — ${savedCustomer.phone || ""}`
        );
        fetchPurchases(savedCustomer.id);
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load customers or products. Check the API endpoints."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchPurchases(customerId) {
    if (!customerId) {
      setPurchases([]);
      return;
    }

    try {
      setHistoryLoading(true);
      const response = await api.get(
        `/api/admin/customers/${customerId}/purchases`
      );
      setPurchases(response.data.purchases || []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load purchase history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => {
      const updated = { ...previous, [name]: value };

      if (name === "product_id") {
        updated.variant_id = "";
        updated.unit_price = "";
      }

      if (name === "variant_id") {
        const variant = variants.find(
          (item) => String(item.id) === String(value)
        );
        updated.unit_price = variant ? String(variant.price) : "";
      }

      return updated;
    });

    if (name === "product_id") {
      const product = products.find(
        (item) => String(item.id) === String(value)
      );
      setVariants(product?.variants || []);
    }
  }

  function handleCustomerSelect(customer) {
    const customerId = customer ? String(customer.id) : "";

    setForm((previous) => ({
      ...previous,
      customer_id: customerId,
    }));
    if (customerId) {
      localStorage.setItem("adminCustomerPurchasesCustomerId", customerId);
    } else {
      localStorage.removeItem("adminCustomerPurchasesCustomerId");
    }

    setCustomerSearch(
      customer
        ? `${customer.full_name || customer.name || ""} — ${customer.phone || ""}`
        : ""
    );
    setDebouncedSearch("");
    setCartItems([]);
    setPurchases([]);
    setError("");
    setSuccess("");

    if (customerId) {
      fetchPurchases(customerId);
    }
  }

  function handleEditPurchase(purchase) {
    const customerId = String(purchase.customer_id ?? form.customer_id ?? "");
    const productId = String(purchase.product_id ?? "");
    const product = products.find((item) => String(item.id) === productId);
    const productVariants = product?.variants || [];

    setEditingPurchaseId(purchase.id);
    setCartItems([]);
    setVariants(productVariants);
    setForm({
      customer_id: customerId,
      product_id: productId,
      variant_id: purchase.variant_id ? String(purchase.variant_id) : "",
      purchase_date: String(purchase.purchase_date || getToday()).slice(0, 10),
      quantity: Number(purchase.quantity || 1),
      unit_price: String(purchase.unit_price ?? ""),
      notes: purchase.notes || "",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEditPurchase() {
    setEditingPurchaseId(null);
    setForm((previous) => ({
      ...initialForm,
      customer_id: previous.customer_id,
      purchase_date: previous.purchase_date || getToday(),
    }));
    setVariants([]);
    setError("");
    setSuccess("");
  }

  function addItemToCart() {
    setError("");
    setSuccess("");

    if (!form.product_id) {
      setError("Please select a product.");
      return;
    }

    if (
      form.quantity === "" ||
      !Number.isFinite(Number(form.quantity)) ||
      Number(form.quantity) <= 0
    ) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (
      form.unit_price === "" ||
      !Number.isFinite(Number(form.unit_price)) ||
      Number(form.unit_price) < 0
    ) {
      setError("Please enter a valid unit price.");
      return;
    }

    const product = products.find(
      (item) => String(item.id) === String(form.product_id)
    );

    const variant = variants.find(
      (item) => String(item.id) === String(form.variant_id)
    );

    const item = {
      cart_id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      product_id: Number(form.product_id),
      product_name: product?.name || "Product",
      variant_id: form.variant_id ? Number(form.variant_id) : null,
      variant_unit: variant?.unit || "",
      quantity: Number(form.quantity),
      unit_price: Number(form.unit_price),
    };

    setCartItems((previous) => [...previous, item]);

    setForm((previous) => ({
      ...previous,
      product_id: "",
      variant_id: "",
      quantity: 1,
      unit_price: "",
    }));
    setVariants([]);
  }

  function removeItemFromCart(cartId) {
    setCartItems((previous) =>
      previous.filter((item) => item.cart_id !== cartId)
    );
  }

  function updateCartQuantity(cartId, value) {
    if (value === "") {
      setCartItems((previous) =>
        previous.map((item) =>
          item.cart_id === cartId ? { ...item, quantity: "" } : item
        )
      );
      return;
    }

    const quantity = Number(value);
    if (!Number.isFinite(quantity) || quantity < 1) return;

    setCartItems((previous) =>
      previous.map((item) =>
        item.cart_id === cartId ? { ...item, quantity } : item
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (editingPurchaseId) {
      if (!form.customer_id || !form.product_id) {
        setError("Please select a customer and product.");
        return;
      }
      if (variants.length > 0 && !form.variant_id) {
        setError("Please select a product variant / pack size.");
        return;
      }
      if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) <= 0) {
        setError("Quantity must be a whole number greater than 0.");
        return;
      }
      if (form.unit_price === "" || !Number.isFinite(Number(form.unit_price)) || Number(form.unit_price) < 0) {
        setError("Please enter a valid unit price.");
        return;
      }

      try {
        setSaving(true);
        const customerId = form.customer_id;
        await api.put(`/api/admin/customer-purchases/${editingPurchaseId}`, {
          customer_id: Number(form.customer_id),
          product_id: Number(form.product_id),
          variant_id: form.variant_id ? Number(form.variant_id) : null,
          purchase_date: form.purchase_date,
          quantity: Number(form.quantity),
          unit_price: Number(form.unit_price),
          notes: form.notes.trim(),
        });
        setSuccess("Purchase updated successfully.");
        setEditingPurchaseId(null);
        setForm((previous) => ({
          ...initialForm,
          customer_id: customerId,
          purchase_date: previous.purchase_date || getToday(),
        }));
        setVariants([]);
        await fetchPurchases(customerId);
      } catch (err) {
        const detail = err.response?.data?.detail;
        setError(
          Array.isArray(detail)
            ? detail.map((item) => item.msg || "Validation error").join(", ")
            : detail || "Failed to update purchase."
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!form.customer_id) {
      setError("Please select a customer.");
      return;
    }

    if (cartItems.length === 0) {
      setError("Please add at least one product before saving.");
      return;
    }

    if (
      cartItems.some(
        (item) =>
          !Number.isFinite(Number(item.quantity)) ||
          Number(item.quantity) <= 0
      )
    ) {
      setError("Every item must have a quantity greater than 0.");
      return;
    }

    try {
      setSaving(true);

      const customerId = form.customer_id;
      const purchaseDate = form.purchase_date;
      localStorage.setItem("adminCustomerPurchasesCustomerId", String(customerId));

      const payload = {
        customer_id: Number(customerId),
        purchase_date: purchaseDate,
        notes: form.notes.trim(),
        items: cartItems.map((item) => ({
          product_id: Number(item.product_id),
          variant_id: item.variant_id ? Number(item.variant_id) : null,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
        })),
      };

      await api.post("/api/admin/customer-purchases", payload);

      setSuccess(
        `${cartItems.length} product item(s) saved successfully. Grand total: ₹${grandTotal.toFixed(2)}`
      );

      setCartItems([]);
      setForm({
        ...initialForm,
        customer_id: customerId,
        purchase_date: purchaseDate,
      });
      setVariants([]);

      await fetchPurchases(customerId);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        Array.isArray(detail)
          ? detail.map((item) => item.msg || "Validation error").join(", ")
          : detail || "Failed to save customer purchase."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.creamDeep,
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Button
          component={Link}
          to="/admin/master-data"
          startIcon={<ArrowLeft size={18} />}
          sx={{ color: colors.forest, mb: 2, textTransform: "none" }}
        >
          Back to Master Data
        </Button>

        <Typography
          sx={{
            fontFamily: fonts.display,
            fontSize: { xs: "1.8rem", md: "2.2rem" },
            fontWeight: 600,
            color: colors.forest,
            mb: 1,
          }}
        >
          Customer Purchases
        </Typography>

        <Typography sx={{ color: colors.inkSoft, mb: 3 }}>
          Record purchases made through Instagram, supermarkets and other
          channels.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess("")}
          >
            {success}
          </Alert>
        )}

        <Card
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: "16px",
            border: `1px solid ${colors.line}`,
            mb: 3,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              color: colors.forest,
              mb: 2,
              textAlign: "center",
              fontSize: "1.2rem",
            }}
          >
            {editingPurchaseId ? `Edit Purchase #${editingPurchaseId}` : "Add Purchase"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Autocomplete
              options={customerOptions}
              value={selectedCustomer}
              inputValue={customerSearch}
              loading={loading}
              getOptionLabel={(customer) =>
                `${customer.full_name || customer.name || ""} — ${customer.phone || ""}`
              }
              isOptionEqualToValue={(option, value) =>
                String(option.id) === String(value.id)
              }
              filterOptions={(options) => options}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === "input") {
                  setCustomerSearch(newInputValue);
                }
                if (reason === "clear") {
                  setCustomerSearch("");
                  setDebouncedSearch("");
                }
              }}
              onChange={(event, customer) => handleCustomerSelect(customer)}
              noOptionsText={
                debouncedSearch
                  ? "No matching customers found"
                  : "No customers available"
              }
              loadingText="Loading customers..."
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Customer"
                  placeholder="Type customer name or phone number..."
                  required={!form.customer_id}
                  sx={{ mb: 2 }}
                />
              )}
              fullWidth
              clearOnBlur={false}
              sx={{ mb: 2 }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                name="purchase_date"
                label="Purchase Date"
                type="date"
                value={form.purchase_date}
                onChange={handleChange}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />

              <TextField
                name="notes"
                label="Order Notes"
                placeholder="e.g. Instagram order, courier details"
                value={form.notes}
                onChange={handleChange}
                fullWidth
              />
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                color: colors.forest,
                mt: 2,
                mb: 2,
              }}
            >
              {editingPurchaseId ? "Edit Product Details" : "Add Products"}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                select
                name="product_id"
                label="Product"
                value={form.product_id}
                onChange={handleChange}
                fullWidth
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                name="variant_id"
                label="Product Variant / Pack Size"
                value={form.variant_id}
                onChange={handleChange}
                fullWidth
                disabled={!form.product_id || variants.length === 0}
              >
                <MenuItem value="">No variant selected</MenuItem>
                {variants.map((variant) => (
                  <MenuItem key={variant.id} value={variant.id}>
                    {variant.unit} — ₹{variant.price}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="quantity"
                label="Quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                fullWidth
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />

              <TextField
                name="unit_price"
                label="Unit Price (₹)"
                type="number"
                value={form.unit_price}
                onChange={handleChange}
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
              }}
            >
              <Typography sx={{ color: colors.inkSoft }}>
                Current item total:{" "}
                <strong>₹{currentItemTotal.toFixed(2)}</strong>
              </Typography>

              <Button
                type="button"
                variant="outlined"
                onClick={addItemToCart}
                startIcon={<Plus size={18} />}
                disabled={!form.product_id || Boolean(editingPurchaseId)}
                sx={{
                  borderColor: colors.forest,
                  color: colors.forest,
                  textTransform: "none",
                  borderRadius: "10px",
                }}
              >
                Add Item
              </Button>
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                color: colors.forest,
                mb: 1.5,
              }}
            >
              Purchase Items ({cartItems.length})
            </Typography>

            {cartItems.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  mb: 2,
                  textAlign: "center",
                  border: `1px dashed ${colors.line}`,
                  borderRadius: "12px",
                  color: colors.inkSoft,
                }}
              >
                Select a product, enter quantity and price, then click Add Item.
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 1.5, mb: 2 }}>
                {cartItems.map((item) => (
                  <Box
                    key={item.cart_id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr 1fr",
                        md: "minmax(180px, 2fr) 100px 120px 130px auto",
                      },
                      alignItems: "center",
                      gap: 1.5,
                      p: 2,
                      border: `1px solid ${colors.line}`,
                      borderRadius: "12px",
                      backgroundColor: colors.creamDeep,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: colors.forest,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {item.product_name}
                      </Typography>
                      {item.variant_unit && (
                        <Typography
                          variant="body2"
                          sx={{ color: colors.inkSoft }}
                        >
                          Pack: {item.variant_unit}
                        </Typography>
                      )}
                    </Box>

                    <TextField
                      label="Quantity"
                      type="number"
                      size="small"
                      value={item.quantity}
                      onChange={(event) =>
                        updateCartQuantity(item.cart_id, event.target.value)
                      }
                      slotProps={{ htmlInput: { min: 1, step: 1 } }}
                    />

                    <Typography sx={{ color: colors.inkSoft }}>
                      ₹{Number(item.unit_price).toFixed(2)} each
                    </Typography>

                    <Typography sx={{ fontWeight: 700, color: colors.forest }}>
                      ₹
                      {(
                        Number(item.quantity || 0) *
                        Number(item.unit_price || 0)
                      ).toFixed(2)}
                    </Typography>

                    <Button
                      type="button"
                      color="error"
                      onClick={() => removeItemFromCart(item.cart_id)}
                      startIcon={<Trash2 size={16} />}
                      sx={{
                        textTransform: "none",
                        gridColumn: { xs: "1 / -1", md: "auto" },
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                p: 2,
                mb: 2,
                borderRadius: "12px",
                backgroundColor: colors.creamDeep,
              }}
            >
              <Box>
                <Typography sx={{ color: colors.inkSoft }}>
                  Total packs/items: {totalQuantity}
                </Typography>
                <Typography
                  sx={{
                    color: colors.forest,
                    fontWeight: 700,
                    fontSize: "1.25rem",
                  }}
                >
                  Grand Total: ₹{grandTotal.toFixed(2)}
                </Typography>
              </Box>

              {!editingPurchaseId && (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    saving ||
                    loading ||
                    !form.customer_id ||
                    cartItems.length === 0
                  }
                  startIcon={
                    saving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <Plus size={18} />
                    )
                  }
                  sx={{
                    backgroundColor: colors.forest,
                    "&:hover": { backgroundColor: "#0e261e" },
                    textTransform: "none",
                    borderRadius: "10px",
                    px: 3,
                    py: 1.2,
                  }}
                >
                  {saving ? "Saving Purchase..." : "Save Purchase"}
                </Button>
              )}
              {editingPurchaseId && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button type="button" variant="outlined" onClick={cancelEditPurchase} startIcon={<X size={18} />} sx={{ textTransform: "none" }}>
                    Cancel Edit
                  </Button>
                  <Button type="submit" variant="contained" disabled={saving || loading} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Pencil size={18} />} sx={{ backgroundColor: colors.forest, textTransform: "none", "&:hover": { backgroundColor: "#0e261e" } }}>
                    {saving ? "Updating..." : "Update Purchase"}
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Card>

        <Card
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: "16px",
            border: `1px solid ${colors.line}`,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, color: colors.forest, mb: 2 }}
          >
            Purchase History
          </Typography>

          {!form.customer_id ? (
            <Typography sx={{ color: colors.inkSoft }}>
              Select a customer above to view their purchases.
            </Typography>
          ) : historyLoading ? (
            <CircularProgress size={26} />
          ) : purchases.length === 0 ? (
            <Typography sx={{ color: colors.inkSoft }}>
              No purchases recorded for this customer.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {purchases.map((purchase) => (
                <Box
                  key={purchase.id}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: colors.creamDeep,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: colors.forest }}>
                    {purchase.product_name}
                    {purchase.variant_unit ? ` · ${purchase.variant_unit}` : ""}
                  </Typography>

                  <Typography sx={{ color: colors.inkSoft, mt: 0.5 }}>
                    Date: {purchase.purchase_date} · Quantity:{" "}
                    {purchase.quantity}
                  </Typography>

                  <Typography sx={{ color: colors.inkSoft, mt: 0.5 }}>
                    ₹{Number(purchase.unit_price || 0).toFixed(2)} each · Total
                    ₹{Number(purchase.total_amount || 0).toFixed(2)}
                  </Typography>

                  {purchase.notes && (
                    <Typography sx={{ color: colors.inkSoft, mt: 0.5 }}>
                      Notes: {purchase.notes}
                    </Typography>
                  )}
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<Pencil size={16} />}
                    onClick={() => handleEditPurchase(purchase)}
                    sx={{ mt: 1.5, color: colors.forest, borderColor: colors.forest, textTransform: "none" }}
                  >
                    Edit Purchase
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}

export default CustomerPurchasesPage;
