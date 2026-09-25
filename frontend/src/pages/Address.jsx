import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  Paper,
  Checkbox,
  FormControlLabel,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { MapPin, Trash2, Pencil } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

function Address() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "home",
    is_default: false,
  });

  async function fetchAddresses() {
    try {
      setLoading(true);
      const response = await api.get("/api/auth/addresses/");
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error("Failed to load addresses:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAddresses();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(
          `/api/auth/addresses/${editingId}/`,
          formData
        );

        toast.success("Address updated successfully!");
      } else {
        await api.post(
          "/api/auth/addresses/",
          formData
        );

        toast.success("Address added successfully!");
      }

      setFormData({
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        address_type: "home",
        is_default: false,
      });

      setEditingId(null);

      fetchAddresses();
      const returnTo = location.state?.returnTo;

      if (returnTo) {
        navigate(returnTo);
      }

    } catch (error) {
      console.error("Failed to save address:", error);

      toast.error(
        error.response?.data?.detail ||
        "Failed to save address"
      );
    }
  }

  function handleEdit(address) {
    setEditingId(address.id);

    setFormData({
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line1: address.address_line1 || "",
      address_line2: address.address_line2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || "",
      address_type: address.address_type || "home",
      is_default: address.is_default || false,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/auth/addresses/${id}/`);
      toast.success("Address deleted");
      fetchAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f7f1e3", py: { xs: 5, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography sx={{ fontWeight: 600, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: "#14342a", mb: 4 }}>
          My Addresses
        </Typography>

        <Grid container spacing={4}>
          {/* Add Address */}
          <Grid item xs={12} md={5}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "22px",
                border: "1px solid rgba(20,52,42,0.1)",
                position: { md: "sticky" },
                top: { md: 24 },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "1.15rem",
                  color: "#14342a",
                  mb: 2.5,
                }}
              >
                {editingId ? "Edit Address" : "Add New Address"}
              </Typography>

              <Stack spacing={2.2}>
                <TextField
                  name="full_name"
                  label="Full Name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  name="address_line1"
                  label="Address Line 1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  rows={3}
                  sx={fieldStyle}
                />

                <TextField
                  name="address_line2"
                  label="Address Line 2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  name="landmark"
                  label="Landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  name="address_type"
                  label="Address Type"
                  value={formData.address_type}
                  onChange={handleChange}
                  select
                  SelectProps={{ native: true }}
                  fullWidth
                  sx={fieldStyle}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </TextField>

                <TextField
                  name="city"
                  label="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  name="state"
                  label="State"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  name="pincode"
                  label="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  fullWidth
                  inputProps={{ maxLength: 6 }}
                  sx={fieldStyle}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      name="is_default"
                      checked={formData.is_default}
                      onChange={handleChange}
                      sx={{ color: "#7fa06f", "&.Mui-checked": { color: "#14342a" } }}
                    />
                  }
                  label="Set as default address"
                  sx={{ color: "#5c554a" }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: "#14342a",
                    color: "#f7f1e3",
                    borderRadius: "100px",
                    py: 1.3,
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#0e261e" },
                  }}
                >
                  {editingId ? "Update Address" : "Add Address"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    fullWidth
                    onClick={() => {
                      setEditingId(null);

                      setFormData({
                        full_name: "",
                        phone: "",
                        address_line1: "",
                        address_line2: "",
                        landmark: "",
                        city: "",
                        state: "",
                        pincode: "",
                        address_type: "home",
                        is_default: false,
                      });
                    }}
                    sx={{
                      color: "#14342a",
                      fontWeight: 600,
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* Saved Addresses */}
          <Grid item xs={12} md={7}>
            <Typography sx={{ fontWeight: 600, fontSize: "1.15rem", color: "#14342a", mb: 2.5 }}>
              Saved Addresses
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: "#14342a" }} />
              </Box>
            ) : addresses.length === 0 ? (
              <Typography sx={{ color: "#5c554a" }}>No saved addresses.</Typography>
            ) : (
              <Stack spacing={2}>
                {addresses.map((address) => (
                  <Paper
                    key={address.id}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: "18px",
                      border: "1px solid rgba(20,52,42,0.1)",
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: "#e4ead9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <MapPin size={18} color="#3f6b4a" />
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5, flexWrap: "wrap" }}>
                        <Typography sx={{ fontWeight: 600, color: "#14342a" }}>
                          {address.full_name}
                        </Typography>
                        {address.is_default && (
                          <Chip
                            label="Default"
                            size="small"
                            sx={{ backgroundColor: "#e4ead9", color: "#3f6b4a", fontWeight: 600, fontSize: "0.7rem" }}
                          />
                        )}
                      </Stack>

                      <Typography sx={{ color: "#5c554a", fontSize: "0.85rem" }}>
                        {address.phone}
                      </Typography>
                      <Typography sx={{ color: "#5c554a", fontSize: "0.85rem", mt: 0.5 }}>
                        {address.address_line1}
                      </Typography>

                      {address.address_line2 && (
                        <Typography sx={{ color: "#5c554a", fontSize: "0.85rem" }}>
                          {address.address_line2}
                        </Typography>
                      )}

                      {address.landmark && (
                        <Typography sx={{ color: "#5c554a", fontSize: "0.85rem" }}>
                          Landmark: {address.landmark}
                        </Typography>
                      )}

                      <Typography sx={{ color: "#5c554a", fontSize: "0.85rem" }}>
                        {address.city}, {address.state} - {address.pincode}
                      </Typography>

                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexShrink: 0,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(address)}
                        sx={{ color: "#3f6b4a" }}
                      >
                        <Pencil size={18} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDelete(address.id)}
                        sx={{ color: "#b23b3b" }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    "& fieldset": { borderColor: "rgba(20,52,42,0.15)" },
    "&:hover fieldset": { borderColor: "#7fa06f" },
    "&.Mui-focused fieldset": { borderColor: "#14342a" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#14342a" },
};

export default Address;