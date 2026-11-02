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

function CustomerTypesPage() {
  const [customerTypes, setCustomerTypes] = useState([]);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchCustomerTypes() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/admin/customer-types");
      setCustomerTypes(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load customer types."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomerTypes();
  }, []);

  function resetForm() {
    setName("");
    setIsActive(true);
    setEditingId(null);
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setName(item.name);
    setIsActive(item.is_active);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Customer type name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: name.trim(),
        is_active: isActive,
      };

      if (editingId !== null) {
        await api.put(
          `/api/admin/customer-types/${editingId}`,
          payload
        );
        setSuccess("Customer type updated successfully.");
      } else {
        await api.post("/api/admin/customer-types", payload);
        setSuccess("Customer type added successfully.");
      }

      resetForm();
      await fetchCustomerTypes();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          (editingId !== null
            ? "Failed to update customer type."
            : "Failed to add customer type.")
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

      await api.delete(`/api/admin/customer-types/${item.id}`);

      if (editingId === item.id) {
        resetForm();
      }

      setSuccess("Customer type deleted successfully.");
      await fetchCustomerTypes();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete customer type."
      );
    } finally {
      setDeletingId(null);
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
          Customer Types
        </Typography>

        <Typography sx={{ color: colors.inkSoft, mb: 3 }}>
          Add, update and manage customer categories.
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
              fontSize: "1.1rem",
              mb: 2,
            }}
          >
            {editingId !== null
              ? "Update Customer Type"
              : "Add Customer Type"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Customer Type Name"
              placeholder="e.g. Instagram, Supermarket, Guest"
              value={name}
              onChange={(event) => setName(event.target.value)}
              fullWidth
              required
              inputProps={{ maxLength: 50 }}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(event) =>
                    setIsActive(event.target.checked)
                  }
                />
              }
              label="Active"
              sx={{ display: "flex", mb: 2 }}
            />

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
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
                  "&:hover": { backgroundColor: "#0e261e" },
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 3,
                  py: 1.2,
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Customer Type"
                    : "Add Customer Type"}
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
              sx={{
                fontWeight: 700,
                color: colors.forest,
                fontSize: "1.1rem",
              }}
            >
              Existing Customer Types
            </Typography>

            <Button
              onClick={fetchCustomerTypes}
              disabled={loading}
              startIcon={<RefreshCw size={16} />}
              sx={{ color: colors.forest, textTransform: "none" }}
            >
              Refresh
            </Button>
          </Box>

          {loading ? (
            <CircularProgress size={26} />
          ) : customerTypes.length === 0 ? (
            <Typography sx={{ color: colors.inkSoft }}>
              No customer types found.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {customerTypes.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    p: 2,
                    borderRadius: "12px",
                    backgroundColor: colors.creamDeep,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 120 }}>
                    <Typography
                      sx={{ color: colors.forest, fontWeight: 600 }}
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
              ))}
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}

export default CustomerTypesPage;