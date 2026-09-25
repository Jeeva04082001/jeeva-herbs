import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) return;
    if (!password) return;

    try {
      setLoading(true);

      const loggedInUser = await login(
        email.trim(),
        password
      );

      if (loggedInUser?.is_staff) {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.error("Login failed:", error);
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
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
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
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              sx={fieldStyle}
            />

            <TextField
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Stack>
        </Box>

        <Typography sx={{ mt: 3, fontSize: "0.9rem", color: "#5c554a", textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#a15c33", fontWeight: 600 }}>
            Create Account
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

export default Login;