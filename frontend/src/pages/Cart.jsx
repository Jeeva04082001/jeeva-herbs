import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  IconButton,
  Button,
  Divider,
  Paper,
} from "@mui/material";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const API_BASE_URL = "http://localhost:8002";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

function Cart() {
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const navigate = useNavigate();

  const deliveryFee = cartSubtotal >= 499 ? 0 : 50;
  const total = cartSubtotal + deliveryFee;

  // -----------------------------
  // EMPTY CART
  // -----------------------------
  if (cartItems.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f1e3",
          textAlign: "center",
          px: 2,
        }}
      >
        <ShoppingBag
          size={44}
          color="#a15c33"
          style={{ marginBottom: 16 }}
        />

        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "1.6rem",
            color: "#14342a",
            mb: 1,
          }}
        >
          Your Cart
        </Typography>

        <Typography
          sx={{
            color: "#5c554a",
            mb: 3,
          }}
        >
          Your cart is empty.
        </Typography>

        <Button
          component={Link}
          to="/products"
          variant="contained"
          sx={{
            backgroundColor: "#14342a",
            color: "#f7f1e3",
            borderRadius: "100px",
            px: 4,
            py: 1.2,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#0e261e",
            },
          }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f7f1e3",
        py: { xs: 5, md: 8 },
      }}
    >
      <Container maxWidth="lg">

        {/* PAGE HEADER */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: {
                xs: "1.8rem",
                md: "2.2rem",
              },
              color: "#14342a",
            }}
          >
            Your Cart
          </Typography>

          <Typography
            sx={{
              color: "#5c554a",
              mt: 0.5,
            }}
          >
            {cartCount} item(s)
          </Typography>
        </Box>

        <Grid container spacing={4}>

          {/* =========================
              CART ITEMS
          ========================= */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>

              {cartItems.map((item) => (
                <Paper
                  key={item.cartKey}
                  elevation={0}
                  sx={{
                    display: "flex",
                    gap: 2.5,
                    p: 2.5,
                    borderRadius: "18px",
                    border:
                      "1px solid rgba(20,52,42,0.1)",
                  }}
                >

                  {/* PRODUCT IMAGE */}
                  {item.image_url && (
                    <Box
                      component="img"
                      src={getImageUrl(item.image_url)}
                      alt={item.name}
                      sx={{
                        width: {
                          xs: 80,
                          sm: 96,
                        },
                        height: {
                          xs: 80,
                          sm: 96,
                        },
                        borderRadius: "14px",
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      flexGrow: 1,
                      minWidth: 0,
                    }}
                  >

                    {/* PRODUCT NAME + REMOVE */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Box>

                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#14342a",
                            mb: 0.5,
                          }}
                        >
                          {item.name}
                        </Typography>

                        {/* PACK SIZE */}
                        <Typography
                          sx={{
                            color: "#5c554a",
                            fontSize: "0.85rem",
                          }}
                        >
                          Pack Size:{" "}
                          <Box
                            component="span"
                            sx={{
                              fontWeight: 600,
                              color: "#14342a",
                            }}
                          >
                            {item.unit}
                          </Box>
                        </Typography>

                        {/* PRICE */}
                        <Typography
                          sx={{
                            color: "#5c554a",
                            fontSize: "0.85rem",
                            mt: 0.3,
                          }}
                        >
                          ₹{Number(item.price).toFixed(2)}
                        </Typography>

                      </Box>

                      {/* REMOVE */}
                      <IconButton
                        size="small"
                        onClick={() =>
                          removeFromCart(item.cartKey)
                        }
                        sx={{
                          color: "#b23b3b",
                        }}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Stack>

                    {/* QUANTITY + ITEM TOTAL */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        mt: 2,
                        flexWrap: "wrap",
                        gap: 1.5,
                      }}
                    >

                      {/* QUANTITY */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          border:
                            "1px solid rgba(20,52,42,0.15)",
                          borderRadius: "100px",
                          px: 0.5,
                        }}
                      >

                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(
                              item.cartKey,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                          sx={{
                            color: "#14342a",
                          }}
                        >
                          <Minus size={16} />
                        </IconButton>

                        <Typography
                          sx={{
                            minWidth: 20,
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() =>
                            updateQuantity(
                              item.cartKey,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            item.quantity >= Number(item.stock)
                          }
                          sx={{
                            color: "#14342a",
                          }}
                        >
                          <Plus size={16} />
                        </IconButton>

                      </Stack>

                      {/* ITEM TOTAL */}
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "#14342a",
                        }}
                      >
                        ₹
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toFixed(2)}
                      </Typography>

                    </Stack>

                    {/* STOCK MESSAGE */}
                    {item.quantity >= Number(item.stock) && (
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#a15c33",
                          mt: 1,
                        }}
                      >
                        Maximum available quantity reached
                      </Typography>
                    )}

                  </Box>
                </Paper>
              ))}

            </Stack>
          </Grid>

          {/* =========================
              ORDER SUMMARY
          ========================= */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: "22px",
                border:
                  "1px solid rgba(20,52,42,0.1)",
                position: {
                  md: "sticky",
                },
                top: {
                  md: 24,
                },
              }}
            >

              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "1.2rem",
                  color: "#14342a",
                  mb: 2.5,
                }}
              >
                Order Summary
              </Typography>

              <Stack spacing={1.2}>

                {/* SUBTOTAL */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      color: "#5c554a",
                      fontSize: "0.9rem",
                    }}
                  >
                    Subtotal
                  </Typography>

                  <Typography
                    sx={{
                      color: "#14342a",
                      fontSize: "0.9rem",
                    }}
                  >
                    ₹{cartSubtotal.toFixed(2)}
                  </Typography>
                </Stack>

                {/* DELIVERY */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      color: "#5c554a",
                      fontSize: "0.9rem",
                    }}
                  >
                    Delivery
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        deliveryFee === 0
                          ? "#3f6b4a"
                          : "#14342a",
                      fontSize: "0.9rem",
                      fontWeight:
                        deliveryFee === 0 ? 600 : 400,
                    }}
                  >
                    {deliveryFee === 0
                      ? "FREE"
                      : `₹${deliveryFee.toFixed(2)}`}
                  </Typography>
                </Stack>

              </Stack>

              <Divider sx={{ my: 2 }} />

              {/* TOTAL */}
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#14342a",
                  }}
                >
                  Total
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#14342a",
                  }}
                >
                  ₹{total.toFixed(2)}
                </Typography>
              </Stack>

              {/* CHECKOUT */}
              <Button
                fullWidth
                variant="contained"
                onClick={() => navigate("/checkout")}
                sx={{
                  backgroundColor: "#14342a",
                  color: "#f7f1e3",
                  borderRadius: "100px",
                  py: 1.4,
                  fontWeight: 600,
                  mb: 1.5,
                  "&:hover": {
                    backgroundColor: "#0e261e",
                  },
                }}
              >
                Proceed to Checkout
              </Button>

              {/* CONTINUE SHOPPING */}
              <Button
                component={Link}
                to="/products"
                fullWidth
                sx={{
                  color: "#a15c33",
                  fontWeight: 600,
                }}
              >
                Continue Shopping
              </Button>

            </Paper>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}

export default Cart;