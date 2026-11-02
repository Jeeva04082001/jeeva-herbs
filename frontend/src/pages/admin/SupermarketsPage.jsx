import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  TextField,
  Button,
  Switch,
  FormControlLabel,
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
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  is_active: true,
};

function SupermarketsPage() {
  const [form, setForm] = useState({ ...initialForm });
  const [supermarkets, setSupermarkets] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchSupermarkets() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/supermarkets");
      setSupermarkets(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load supermarkets."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSupermarkets();
  }, []);

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditingId(null);
  }

  function handleEdit(item) {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      phone: item.phone || "",
      address: item.address || "",
      city: item.city || "",
      state: item.state || "",
      pincode: item.pincode || "",
      is_active: item.is_active,
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Supermarket name is required.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId !== null) {
        await api.put(
          `/api/admin/supermarkets/${editingId}`,
          payload
        );

        setSuccess("Supermarket updated successfully.");
      } else {
        await api.post("/api/admin/supermarkets", payload);

        setSuccess("Supermarket added successfully.");
      }

      resetForm();
      await fetchSupermarkets();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          (editingId !== null
            ? "Failed to update supermarket."
            : "Failed to add supermarket.")
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      setError("");
      setSuccess("");

      await api.delete(`/api/admin/supermarkets/${item.id}`);

      if (editingId === item.id) {
        resetForm();
      }

      setSuccess("Supermarket deleted successfully.");
      await fetchSupermarkets();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete supermarket."
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
      <Container maxWidth="md">
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
          Supermarkets
        </Typography>

        <Typography sx={{ color: colors.inkSoft, mb: 3 }}>
          Add, update and manage supermarket details.
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
            {editingId !== null
              ? "Update Supermarket"
              : "Add Supermarket"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              name="name"
              label="Supermarket Name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ maxLength: 160 }}
              sx={fieldSx}
            />

            <TextField
              name="phone"
              label="Phone Number"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              sx={fieldSx}
            />

            <TextField
              name="address"
              label="Address"
              value={form.address}
              onChange={handleChange}
              multiline
              minRows={2}
              fullWidth
              sx={fieldSx}
            />

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

            <FormControlLabel
              sx={{ display: "flex", my: 2 }}
              control={
                <Switch
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
              }
              label="Active"
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
                disabled={saving}
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
                    ? "Update Supermarket"
                    : "Add Supermarket"}
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
              Existing Supermarkets
            </Typography>

            <Button
              onClick={fetchSupermarkets}
              disabled={loading}
              startIcon={<RefreshCw size={16} />}
              sx={{
                color: colors.forest,
                textTransform: "none",
              }}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <CircularProgress size={26} />
          ) : supermarkets.length === 0 ? (
            <Typography sx={{ color: colors.inkSoft }}>
              No supermarkets found.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {supermarkets.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: colors.creamDeep,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 150 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: colors.forest,
                        }}
                      >
                        {item.name}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          color: item.is_active ? "#267044" : "#777",
                          mt: 0.5,
                        }}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </Typography>

                      {item.phone && (
                        <Typography
                          sx={{ color: colors.inkSoft, mt: 0.5 }}
                        >
                          Phone: {item.phone}
                        </Typography>
                      )}

                      {[
                        item.address,
                        item.city,
                        item.state,
                        item.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ") && (
                        <Typography
                          sx={{ color: colors.inkSoft, mt: 0.5 }}
                        >
                          {[
                            item.address,
                            item.city,
                            item.state,
                            item.pincode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </Typography>
                      )}
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Pencil size={15} />}
                        onClick={() => handleEdit(item)}
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
                          deletingId === item.id ? (
                            <CircularProgress size={14} />
                          ) : (
                            <Trash2 size={15} />
                          )
                        }
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                        sx={{ textTransform: "none" }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}

export default SupermarketsPage;