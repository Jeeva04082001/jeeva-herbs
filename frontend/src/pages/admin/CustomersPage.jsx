import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";

const initialForm = {
  full_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  customer_type_id: "",
  supermarket_id: "",
  notes: "",
};

function CustomersPage() {
  const [form, setForm] = useState({ ...initialForm });
  const [customers, setCustomers] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedType = customerTypes.find(
    (type) => String(type.id) === String(form.customer_type_id)
  );

  const isSupermarket =
    selectedType?.name?.toLowerCase() === "supermarket";

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [
        typesResponse,
        supermarketsResponse,
        customersResponse,
      ] = await Promise.all([
        api.get("/api/admin/customer-types"),
        api.get("/api/admin/supermarkets"),
        api.get("/api/admin/customers"),
      ]);

      setCustomerTypes(typesResponse.data);
      setSupermarkets(supermarketsResponse.data);
      setCustomers(customersResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load customer information."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "customer_type_id"
        ? { supermarket_id: "" }
        : {}),
    }));
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditingId(null);
  }

  function handleEdit(customer) {
    setEditingId(customer.id);

    setForm({
      full_name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      pincode: customer.pincode || "",
      customer_type_id: customer.customer_type?.id
        ? String(customer.customer_type.id)
        : "",
      supermarket_id: customer.supermarket?.id
        ? String(customer.supermarket.id)
        : "",
      notes: customer.notes || "",
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.full_name.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (!form.customer_type_id) {
      setError("Please select a customer type.");
      return;
    }

    if (isSupermarket && !form.supermarket_id) {
      setError("Please select a supermarket.");
      return;
    }

    const payload = {
      ...form,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      customer_type_id: Number(form.customer_type_id),
      supermarket_id: form.supermarket_id
        ? Number(form.supermarket_id)
        : null,
      notes: form.notes.trim(),
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId !== null) {
        await api.put(
          `/api/admin/customers/${editingId}`,
          payload
        );

        setSuccess("Customer updated successfully.");
      } else {
        await api.post("/api/admin/customers", payload);

        setSuccess("Customer added successfully.");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          (editingId !== null
            ? "Failed to update customer."
            : "Failed to add customer.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${customer.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(customer.id);
      setError("");
      setSuccess("");

      await api.delete(`/api/admin/customers/${customer.id}`);

      if (editingId === customer.id) {
        resetForm();
      }

      setSuccess("Customer deleted successfully.");
      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete customer."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const fieldSx = { mb: 2 };

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
          sx={{ color: colors.forest, mb: 2 }}
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
          Customers
        </Typography>

        <Typography sx={{ color: colors.inkSoft, mb: 3 }}>
          Add, update and manage customers from Instagram,
          supermarkets and other sources.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
            }}
          >
            {editingId !== null ? "Update Customer" : "Add Customer"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                name="full_name"
                label="Customer Name"
                value={form.full_name}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ maxLength: 120 }}
              />

              <TextField
                name="phone"
                label="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ maxLength: 20 }}
              />

              <TextField
                name="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                select
                name="customer_type_id"
                label="Customer Type"
                value={form.customer_type_id}
                onChange={handleChange}
                required
                fullWidth
              >
                {customerTypes.map((type) => (
                  <MenuItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>

              {isSupermarket && (
                <TextField
                  select
                  name="supermarket_id"
                  label="Select Supermarket"
                  value={form.supermarket_id}
                  onChange={handleChange}
                  required
                  fullWidth
                >
                  {supermarkets.map((item) => (
                    <MenuItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                name="address"
                label="Address"
                value={form.address}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                name="city"
                label="City"
                value={form.city}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                name="state"
                label="State"
                value={form.state}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                name="pincode"
                label="Pincode"
                value={form.pincode}
                onChange={handleChange}
                fullWidth
                inputProps={{ maxLength: 10 }}
              />
            </Box>

            <TextField
              name="notes"
              label="Notes"
              placeholder="e.g. Instagram order, customer preferences"
              value={form.notes}
              onChange={handleChange}
              multiline
              minRows={2}
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            />

            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
            >
              <Button
                type="submit"
                variant="contained"
                disabled={saving || customerTypes.length === 0}
                startIcon={
                  saving ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : editingId !== null ? (
                    <Save size={18} />
                  ) : (
                    <Plus size={18} />
                  )
                }
                sx={{
                  backgroundColor: colors.forest,
                  "&:hover": {
                    backgroundColor: "#0e261e",
                  },
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 3,
                  py: 1.2,
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Customer"
                    : "Add Customer"}
              </Button>

              {editingId !== null && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  startIcon={<X size={18} />}
                  sx={{
                    color: colors.forest,
                    borderColor: colors.line,
                    textTransform: "none",
                    borderRadius: "10px",
                  }}
                >
                  Cancel
                </Button>
              )}
            </Stack>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Typography
              sx={{ fontWeight: 700, color: colors.forest }}
            >
              Existing Customers
            </Typography>

            <Button
              onClick={fetchData}
              disabled={loading}
              startIcon={<RefreshCw size={16} />}
              sx={{ color: colors.forest, textTransform: "none" }}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <CircularProgress size={26} />
          ) : customers.length === 0 ? (
            <Typography sx={{ color: colors.inkSoft }}>
              No customers found.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {customers.map((customer) => (
                <Box
                  key={customer.id}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: colors.creamDeep,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: colors.forest,
                      }}
                    >
                      {customer.name}
                    </Typography>

                    <Typography
                      sx={{ color: colors.inkSoft, mt: 0.5 }}
                    >
                      {customer.phone}
                      {customer.email ? ` · ${customer.email}` : ""}
                    </Typography>

                    <Typography
                      sx={{ color: colors.inkSoft, mt: 0.5 }}
                    >
                      Type: {customer.customer_type?.name || "Not assigned"}
                      {customer.supermarket?.name
                        ? ` · ${customer.supermarket.name}`
                        : ""}
                    </Typography>

                    {customer.city && (
                      <Typography
                        sx={{ color: colors.inkSoft, mt: 0.5 }}
                      >
                        {customer.city}
                        {customer.state ? `, ${customer.state}` : ""}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Pencil size={15} />}
                      onClick={() => handleEdit(customer)}
                      sx={{
                        textTransform: "none",
                        color: colors.forest,
                        borderColor: colors.line,
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={
                        deletingId === customer.id ? (
                          <CircularProgress size={14} />
                        ) : (
                          <Trash2 size={15} />
                        )
                      }
                      disabled={deletingId === customer.id}
                      onClick={() => handleDelete(customer)}
                      sx={{ textTransform: "none" }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}

export default CustomersPage;