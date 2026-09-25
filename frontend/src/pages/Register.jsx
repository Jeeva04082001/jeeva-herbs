import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7f1e3",
        px: 2,
        py: 6,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 4, sm: 5 },
          borderRadius: "22px",
          border: "1px solid rgba(20,52,42,0.1)",
        }}
      >
        <Typography
          sx={{ fontWeight: 700, fontSize: "1.4rem", color: "#14342a", mb: 0.5 }}
        >
          Jeeva <Box component="span" sx={{ color: "#c99a3e", fontStyle: "italic", fontWeight: 500 }}>herbal</Box>
        </Typography>

        <Typography sx={{ fontWeight: 600, fontSize: "1.6rem", color: "#14342a", mb: 3 }}>
          Create Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Name"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              sx={fieldStyle}
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
              sx={fieldStyle}
            />

            <TextField
              label="Phone"
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
              fullWidth
              sx={fieldStyle}
            />

            <TextField
              label="Password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              sx={fieldStyle}
            />

            <TextField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              sx={fieldStyle}
            />

            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#14342a",
                color: "#f7f1e3",
                py: 1.4,
                borderRadius: "100px",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#0e261e" },
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </Stack>
        </Box>

        <Typography sx={{ mt: 3, fontSize: "0.9rem", color: "#5c554a", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#a15c33", fontWeight: 600 }}>
            Login
          </Link>
        </Typography>
      </Paper>
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

export default Register;