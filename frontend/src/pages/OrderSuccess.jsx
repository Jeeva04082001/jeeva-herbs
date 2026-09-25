import { Link, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
} from "@mui/material";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";

function OrderSuccess() {
  const { order_number } = useParams();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f7f1e3",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: "24px",
            textAlign: "center",
            border: "1px solid rgba(20,52,42,0.1)",
          }}
        >
          <Box
            sx={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              backgroundColor: "#e4ead9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <CheckCircle size={42} color="#3f6b4a" />
          </Box>

          <Typography
            sx={{
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              fontWeight: 700,
              color: "#14342a",
              mb: 1,
            }}
          >
            Order Placed Successfully!
          </Typography>

          <Typography
            sx={{
              color: "#5c554a",
              fontSize: "1rem",
              mb: 3,
            }}
          >
            Thank you for shopping with Jeeva Herbs.
          </Typography>

          <Box
            sx={{
              backgroundColor: "#f7f1e3",
              borderRadius: "14px",
              p: 2.5,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#5c554a",
                mb: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Order Number
            </Typography>

            <Typography
              sx={{
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#14342a",
              }}
            >
              #{order_number}
            </Typography>
          </Box>

          <Typography
            sx={{
              color: "#5c554a",
              fontSize: "0.9rem",
              mb: 4,
            }}
          >
            Your order has been received and will be processed soon.
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              justifyContent: "center",
            }}
          >
            <Button
              component={Link}
              to={`/orders/${order_number}`}
              variant="contained"
              startIcon={<Package size={18} />}
              sx={{
                backgroundColor: "#14342a",
                color: "#f7f1e3",
                borderRadius: "100px",
                px: 3,
                py: 1.2,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#0e261e",
                },
              }}
            >
              View Order
            </Button>

            <Button
              component={Link}
              to="/products"
              variant="outlined"
              startIcon={<ShoppingBag size={18} />}
              sx={{
                color: "#14342a",
                borderColor: "#14342a",
                borderRadius: "100px",
                px: 3,
                py: 1.2,
                fontWeight: 600,
                "&:hover": {
                  borderColor: "#14342a",
                  backgroundColor: "#e4ead9",
                },
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default OrderSuccess;