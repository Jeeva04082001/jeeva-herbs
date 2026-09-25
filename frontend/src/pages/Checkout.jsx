import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  Paper,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import { ShoppingBag } from "lucide-react";


function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);

  const [formData, setFormData] = useState({
    customer_name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    pincode: "",
    payment_method: "cod",
  });

  const [loading, setLoading] = useState(false);

  const deliveryFee = cartSubtotal >= 499 ? 0 : 50;
  const total = cartSubtotal + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) {
      setAddressLoading(false);
      return;
    }

    fetchSavedAddresses();
  }, [isAuthenticated]);

  async function fetchSavedAddresses() {
    try {
      setAddressLoading(true);

      const response = await api.get("/api/auth/addresses/");

      const addresses = response.data.addresses || [];

      setSavedAddresses(addresses);

      // Automatically select default address
      const defaultAddress = addresses.find(
        (address) => address.is_default
      );

      if (defaultAddress) {
        selectAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Failed to load saved addresses:", error);
    } finally {
      setAddressLoading(false);
    }
  }

  function selectAddress(address) {
    setSelectedAddressId(String(address.id));

    setFormData((prev) => ({
      ...prev,
      customer_name: address.full_name || "",
      phone: address.phone || "",
      address: [
        address.address_line1,
        address.address_line2,
        address.landmark ? `Landmark: ${address.landmark}` : "",
        address.city,
        address.state,
      ]
        .filter(Boolean)
        .join(", "),
      pincode: address.pincode || "",
    }));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login before checkout");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/products");
      return;
    }

    try {
      setLoading(true);

      const items = cartItems.map((item) => ({
        product_id: item.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      }));

      // --------------------------------
      // CASH ON DELIVERY
      // --------------------------------
      if (formData.payment_method === "cod") {
        const payload = {
          ...formData,
          items,
        };

        const response = await api.post("/api/orders", payload);

        toast.success("Order placed successfully!");
        clearCart();

        // navigate(`/order-success/${response.data.order_number}`);
        navigate("/CustomerOrders");
        return;
      }

      // --------------------------------
      // ONLINE PAYMENT
      // --------------------------------

      // 1. Create Razorpay order from backend
      const orderResponse = await api.post(
        "/api/payments/create-order",
        { items }
      );

      const {
        razorpay_order_id,
        razorpay_key_id,
        amount,
        currency,
      } = orderResponse.data;

      // Load Razorpay only on Checkout when online payment is selected
      const razorpayLoaded = await loadRazorpayScript();

      if (!razorpayLoaded) {
        toast.error("Unable to load Razorpay. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: currency,
        name: "Jeeva Herbs",
        description: "Jeeva Herbs Order",
        order_id: razorpay_order_id,

        prefill: {
          name: formData.customer_name,
          email: formData.email,
          contact: formData.phone,
        },

        theme: {
          color: "#14342a",
        },

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await api.post("/api/payments/verify", {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,

              customer_name: formData.customer_name,
              phone: formData.phone,
              email: formData.email,
              address: formData.address,
              pincode: formData.pincode,

              items: cartItems.map((item) => ({
                product_id: item.id,
                variant_id: item.variant_id,
                quantity: item.quantity,
              })),
            });

            if (verifyResponse.data.success) {
              toast.success("Payment successful! Order placed.");

              // Clear cart
              clearCart();

              // Go to customer orders
              navigate("/orders");
            }
          } catch (error) {
            console.error("Payment verification error:", error);

            toast.error(
              error.response?.data?.detail ||
              "Payment verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
            toast("Payment window closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error(
          "Razorpay payment failed:",
          response.error
        );

        toast.error(
          response.error?.description ||
          "Payment failed"
        );

        setLoading(false);
      });

      razorpay.open();

    } catch (error) {
      console.error("Checkout failed:", error);

      toast.error(
        error.response?.data?.detail ||
        "Unable to start payment"
      );

      setLoading(false);
    }
  }

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
        <ShoppingBag size={44} color="#a15c33" style={{ marginBottom: 16 }} />
        <Typography sx={{ fontWeight: 600, fontSize: "1.6rem", color: "#14342a", mb: 3 }}>
          Your cart is empty
        </Typography>
        <Button
          onClick={() => navigate("/products")}
          variant="contained"
          sx={{
            backgroundColor: "#14342a",
            color: "#f7f1e3",
            borderRadius: "100px",
            px: 4,
            py: 1.2,
            fontWeight: 600,
            "&:hover": { backgroundColor: "#0e261e" },
          }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f7f1e3", py: { xs: 5, md: 8 } }}>
      <Container maxWidth="lg">
        <Typography sx={{ fontWeight: 600, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: "#14342a", mb: 4 }}>
          Checkout
        </Typography>

        <Grid container spacing={4}>
          {/* Delivery + Payment Form */}
          <Grid item xs={12} md={7}>
            <Paper
              component="form"
              onSubmit={handleSubmit}
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "22px",
                border: "1px solid rgba(20,52,42,0.1)",
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "1.15rem", color: "#14342a", mb: 2.5 }}>
                Delivery Details
              </Typography>

              {savedAddresses.length > 0 && (
                <>
                  <Button
                    type="button"
                    variant="outlined"
                    fullWidth
                    onClick={() =>
                      navigate("/account/addresses", {
                        state: { returnTo: "/checkout" },
                      })
                    }
                    sx={{
                      mt: 2,
                      mb: 3,
                      borderColor: "#14342a",
                      color: "#14342a",
                      borderRadius: "100px",
                      py: 1.2,
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#14342a",
                        backgroundColor: "#e4ead9",
                      },
                    }}
                  >
                    + Add New Address
                  </Button>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <FormLabel
                      sx={{
                        color: "#14342a",
                        fontWeight: 600,
                        mb: 1.5,
                        "&.Mui-focused": {
                          color: "#14342a",
                        },
                      }}
                    >
                      Saved Addresses
                    </FormLabel>

                    <RadioGroup
                      value={selectedAddressId}
                      onChange={(e) => {
                        const address = savedAddresses.find(
                          (item) => String(item.id) === e.target.value
                        );

                        if (address) {
                          selectAddress(address);
                        }
                      }}
                    >
                      <Stack spacing={1.5}>
                        {savedAddresses.map((address) => (
                          <Paper
                            key={address.id}
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: "14px",
                              border:
                                String(address.id) === String(selectedAddressId)
                                  ? "2px solid #14342a"
                                  : "1px solid rgba(20,52,42,0.15)",
                              backgroundColor:
                                String(address.id) === String(selectedAddressId)
                                  ? "#e4ead9"
                                  : "#fff",
                            }}
                          >
                            <FormControlLabel
                              value={String(address.id)}
                              control={
                                <Radio
                                  sx={{
                                    color: "#7fa06f",
                                    "&.Mui-checked": {
                                      color: "#14342a",
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      color: "#14342a",
                                    }}
                                  >
                                    {address.full_name}

                                    {address.is_default && (
                                      <Box
                                        component="span"
                                        sx={{
                                          ml: 1,
                                          fontSize: "0.7rem",
                                          color: "#3f6b4a",
                                          fontWeight: 600,
                                        }}
                                      >
                                        DEFAULT
                                      </Box>
                                    )}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontSize: "0.82rem",
                                      color: "#5c554a",
                                      mt: 0.3,
                                    }}
                                  >
                                    {address.phone}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontSize: "0.82rem",
                                      color: "#5c554a",
                                      mt: 0.3,
                                    }}
                                  >
                                    {address.address_line1}
                                  </Typography>

                                  {address.address_line2 && (
                                    <Typography
                                      sx={{
                                        fontSize: "0.82rem",
                                        color: "#5c554a",
                                      }}
                                    >
                                      {address.address_line2}
                                    </Typography>
                                  )}

                                  {address.landmark && (
                                    <Typography
                                      sx={{
                                        fontSize: "0.82rem",
                                        color: "#5c554a",
                                      }}
                                    >
                                      Landmark: {address.landmark}
                                    </Typography>
                                  )}

                                  <Typography
                                    sx={{
                                      fontSize: "0.82rem",
                                      color: "#5c554a",
                                    }}
                                  >
                                    {address.city}, {address.state} - {address.pincode}
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                alignItems: "flex-start",
                                m: 0,
                                width: "100%",
                              }}
                            />
                          </Paper>
                        ))}
                      </Stack>
                    </RadioGroup>
                  </FormControl>





                  <Divider sx={{ mb: 3 }} />
                </>
              )}

              <Stack spacing={2.5}>
                <TextField
                  label="Name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  label="Phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  fullWidth
                  multiline
                  rows={4}
                  sx={fieldStyle}
                />

                <TextField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  fullWidth
                  inputProps={{ maxLength: 6 }}
                  sx={fieldStyle}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Typography sx={{ fontWeight: 600, fontSize: "1.15rem", color: "#14342a", mb: 1.5 }}>
                Payment Method
              </Typography>

              <RadioGroup
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="cod"
                  control={
                    <Radio
                      sx={{
                        color: "#7fa06f",
                        "&.Mui-checked": {
                          color: "#14342a",
                        },
                      }}
                    />
                  }
                  label="Cash on Delivery"
                  sx={{ color: "#14342a" }}
                />

                <FormControlLabel
                  value="online"
                  control={
                    <Radio
                      sx={{
                        color: "#7fa06f",
                        "&.Mui-checked": {
                          color: "#14342a",
                        },
                      }}
                    />
                  }
                  label="Online Payment (Wallet / Card / Net Banking)"
                  sx={{ color: "#14342a" }}
                />
              </RadioGroup>

              <Button
                type="submit"
                disabled={loading}
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  backgroundColor: "#14342a",
                  color: "#f7f1e3",
                  borderRadius: "100px",
                  py: 1.4,
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#0e261e" },
                }}
              >
                {loading ? "Placing Order..." : `Place Order ₹${total.toFixed(2)}`}
              </Button>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: "22px",
                border: "1px solid rgba(20,52,42,0.1)",
                position: { md: "sticky" },
                top: { md: 24 },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "1.15rem", color: "#14342a", mb: 2.5 }}>
                Order Summary
              </Typography>

              <Stack spacing={1.2} sx={{ mb: 2 }}>
                {cartItems.map((item) => (
                  <Stack direction="row" justifyContent="space-between" key={item.id}>
                    <Typography sx={{ color: "#5c554a", fontSize: "0.9rem" }}>
                      {item.name} × {item.quantity}
                    </Typography>
                    <Typography sx={{ color: "#14342a", fontSize: "0.9rem" }}>
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#5c554a", fontSize: "0.9rem" }}>Subtotal</Typography>
                  <Typography sx={{ color: "#14342a", fontSize: "0.9rem" }}>
                    ₹{cartSubtotal.toFixed(2)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ color: "#5c554a", fontSize: "0.9rem" }}>Delivery</Typography>
                  <Typography sx={{ color: deliveryFee === 0 ? "#3f6b4a" : "#14342a", fontSize: "0.9rem", fontWeight: deliveryFee === 0 ? 600 : 400 }}>
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee.toFixed(2)}`}
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontWeight: 700, color: "#14342a" }}>Total</Typography>
                <Typography sx={{ fontWeight: 700, color: "#14342a" }}>₹{total.toFixed(2)}</Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box >
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

export default Checkout;