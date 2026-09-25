import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Chip,
  IconButton,
  Skeleton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  ClipboardList,
  RefreshCw,
  Eye,
  Package,
} from "lucide-react";

import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";
import toast from "react-hot-toast";


const ADMIN_RADIUS = "16px";

function getStatusColor(status) {
  switch (status) {
    case "pending":
      return {
        background: "rgba(201,154,62,0.15)",
        color: colors.clay,
      };

    case "confirmed":
      return {
        background: "rgba(63,107,74,0.12)",
        color: colors.moss,
      };

    case "packed":
      return {
        background: "rgba(20,52,42,0.10)",
        color: colors.forest,
      };

    case "shipped":
      return {
        background: "rgba(63,107,74,0.16)",
        color: colors.moss,
      };

    case "delivered":
      return {
        background: "rgba(63,107,74,0.20)",
        color: colors.forest,
      };

    case "cancelled":
      return {
        background: "rgba(161,92,51,0.12)",
        color: colors.clay,
      };

    default:
      return {
        background: colors.leafPale,
        color: colors.forest,
      };
  }
}

function StatusChip({ status }) {
  const style = getStatusColor(status);

  return (
    <Chip
      label={status?.replace("_", " ").toUpperCase()}
      size="small"
      sx={{
        backgroundColor: style.background,
        color: style.color,
        fontWeight: 700,
        fontSize: "0.7rem",
      }}
    />
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);

      const response = await api.get("/api/admin/orders");

      setOrders(response.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }


  async function updateOrderStatus() {
    if (!selectedOrder || !newStatus) {
      return;
    }

    try {
      setUpdatingStatus(true);

      const response = await api.put(
        `/api/admin/orders/${selectedOrder.order_number}/status`,
        {
          status: newStatus,
        }
      );

      // Update selected order in popup
      setSelectedOrder((prev) => ({
        ...prev,
        status: response.data.status,
      }));

      // Update order in main list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_number === selectedOrder.order_number
            ? {
              ...order,
              status: response.data.status,
            }
            : order
        )
      );

      toast.success("Order status updated successfully");
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(
        error.response?.data?.detail ||
        "Failed to update order status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  }



  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.creamDeep,
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">

        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: colors.moss,
                mb: 0.5,
              }}
            >
              Store Management
            </Typography>

            <Typography
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                color: colors.forest,
              }}
            >
              Orders
            </Typography>

            <Typography
              sx={{
                fontSize: "0.9rem",
                color: colors.inkSoft,
                mt: 0.5,
              }}
            >
              Manage customer orders and order status.
            </Typography>
          </Box>

          <Tooltip title="Refresh orders">
            <span>
              <IconButton
                onClick={fetchOrders}
                disabled={loading}
                sx={{
                  backgroundColor: colors.forest,
                  color: colors.cream,
                  borderRadius: "10px",
                  p: 1.2,
                  "&:hover": {
                    backgroundColor: "#0e261e",
                  },
                }}
              >
                <RefreshCw
                  size={18}
                  style={{
                    animation: loading
                      ? "orderSpin 0.9s linear infinite"
                      : "none",
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              "@keyframes orderSpin": {
                from: {
                  transform: "rotate(0deg)",
                },
                to: {
                  transform: "rotate(360deg)",
                },
              },
            }}
          />
        </Box>

        {/* ORDER COUNT */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: ADMIN_RADIUS,
            backgroundColor: "#fff",
            p: 2,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.leafPale,
              color: colors.moss,
            }}
          >
            <ClipboardList size={19} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: colors.inkSoft,
              }}
            >
              Total Orders
            </Typography>

            <Typography
              sx={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: colors.forest,
              }}
            >
              {loading ? "..." : orders.length}
            </Typography>
          </Box>
        </Card>

        {/* ORDERS */}
        {loading ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            {[1, 2, 3].map((item) => (
              <Card
                key={item}
                elevation={0}
                sx={{
                  border: `1px solid ${colors.line}`,
                  borderRadius: ADMIN_RADIUS,
                  p: 2.5,
                }}
              >
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="20%" />
              </Card>
            ))}
          </Box>
        ) : orders.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${colors.line}`,
              borderRadius: ADMIN_RADIUS,
              backgroundColor: "#fff",
              p: { xs: 4, md: 6 },
              textAlign: "center",
            }}
          >
            <Package
              size={42}
              color={colors.moss}
            />

            <Typography
              sx={{
                fontFamily: fonts.display,
                fontSize: "1.3rem",
                fontWeight: 600,
                color: colors.forest,
                mt: 2,
              }}
            >
              No orders yet
            </Typography>

            <Typography
              sx={{
                color: colors.inkSoft,
                mt: 0.5,
              }}
            >
              Customer orders will appear here.
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            {orders.map((order) => (
              <Card
                key={order.order_number}
                elevation={0}
                sx={{
                  border: `1px solid ${colors.line}`,
                  borderRadius: ADMIN_RADIUS,
                  backgroundColor: "#fff",
                  p: { xs: 2, md: 2.5 },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1.3fr 1.2fr 0.8fr 0.9fr 0.8fr 0.5fr",
                    },
                    gap: 2,
                    alignItems: "center",
                  }}
                >

                  {/* ORDER */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: colors.inkSoft,
                        mb: 0.4,
                      }}
                    >
                      ORDER
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: colors.forest,
                      }}
                    >
                      #{order.order_number}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        color: colors.inkSoft,
                        mt: 0.4,
                      }}
                    >
                      {formatDate(order.created_at)}
                    </Typography>
                  </Box>

                  {/* CUSTOMER */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: colors.inkSoft,
                        mb: 0.4,
                      }}
                    >
                      CUSTOMER
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: colors.forest,
                      }}
                    >
                      {order.customer?.name || "-"}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color: colors.inkSoft,
                      }}
                    >
                      {order.customer?.phone || "-"}
                    </Typography>
                  </Box>

                  {/* ITEMS */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: colors.inkSoft,
                        mb: 0.4,
                      }}
                    >
                      ITEMS
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: colors.forest,
                      }}
                    >
                      {order.items?.length || 0} product
                      {(order.items?.length || 0) !== 1 ? "s" : ""}
                    </Typography>
                  </Box>

                  {/* TOTAL */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: colors.inkSoft,
                        mb: 0.4,
                      }}
                    >
                      TOTAL
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: colors.forest,
                      }}
                    >
                      {formatCurrency(order.total)}
                    </Typography>
                  </Box>

                  {/* STATUS */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: colors.inkSoft,
                        mb: 0.5,
                      }}
                    >
                      STATUS
                    </Typography>

                    <StatusChip status={order.status} />
                  </Box>

                  {/* VIEW */}
                  <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Eye size={15} />}
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                      }}
                      // onClick={() => setSelectedOrder(order)}
                      sx={{
                        borderColor: colors.line,
                        color: colors.forest,
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": {
                          borderColor: colors.moss,
                          backgroundColor: colors.leafPale,
                        },
                      }}
                    >
                      View
                    </Button>
                  </Box>

                </Box>
              </Card>
            ))}
          </Box>
        )}

      </Container>



      {/* ORDER DETAILS */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedOrder && (
          <>
            <DialogTitle
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                color: colors.forest,
              }}
            >
              Order Details
            </DialogTitle>

            <DialogContent dividers>
              {/* ORDER INFO */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: colors.inkSoft,
                    mb: 0.5,
                  }}
                >
                  ORDER NUMBER
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.forest,
                    fontSize: "1.1rem",
                  }}
                >
                  #{selectedOrder.order_number}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: colors.inkSoft,
                    mt: 0.5,
                  }}
                >
                  {formatDate(selectedOrder.created_at)}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* CUSTOMER */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.forest,
                    mb: 1.2,
                  }}
                >
                  Customer
                </Typography>

                <Typography>
                  {selectedOrder.customer?.name || "-"}
                </Typography>

                <Typography sx={{ color: colors.inkSoft }}>
                  {selectedOrder.customer?.phone || "-"}
                </Typography>

                <Typography sx={{ color: colors.inkSoft }}>
                  {selectedOrder.customer?.email || "-"}
                </Typography>
              </Box>

              {/* ADDRESS */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.forest,
                    mb: 1.2,
                  }}
                >
                  Delivery Address
                </Typography>

                <Typography>
                  {selectedOrder.address || "-"}
                </Typography>

                <Typography sx={{ color: colors.inkSoft }}>
                  Pincode: {selectedOrder.pincode || "-"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* PRODUCTS */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.forest,
                    mb: 1.5,
                  }}
                >
                  Products
                </Typography>

                {selectedOrder.items?.map((item) => (
                  <Box
                    key={item.product_id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      py: 1,
                      borderBottom: `1px solid ${colors.line}`,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: colors.forest,
                        }}
                      >
                        {item.product_name}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          color: colors.inkSoft,
                        }}
                      >
                        Pack Size: {item.pack_size || "-"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          color: colors.inkSoft,
                          mt: 0.2,
                        }}
                      >
                        {item.quantity} × {formatCurrency(item.unit_price)}
                      </Typography>

                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: colors.forest,
                      }}
                    >
                      {formatCurrency(item.line_total)}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* PAYMENT */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.forest,
                    mb: 1,
                  }}
                >
                  Payment
                </Typography>

                <Typography>
                  Method:{" "}
                  {selectedOrder.payment_method?.toUpperCase() || "-"}
                </Typography>

                <Typography>
                  Payment Status:{" "}
                  {selectedOrder.payment_status?.toUpperCase() || "-"}
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* ORDER STATUS */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: colors.forest,
                    mb: 1.2,
                  }}
                >
                  Order Status
                </Typography>

                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>

                  <Select
                    value={newStatus}
                    label="Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <MenuItem value="pending">
                      Pending
                    </MenuItem>

                    <MenuItem value="confirmed">
                      Confirmed
                    </MenuItem>

                    <MenuItem value="packed">
                      Packed
                    </MenuItem>

                    <MenuItem value="shipped">
                      Shipped
                    </MenuItem>

                    <MenuItem value="delivered">
                      Delivered
                    </MenuItem>

                    <MenuItem value="cancelled">
                      Cancelled
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>


              <Divider sx={{ mb: 2 }} />

              {/* TOTAL */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Subtotal</Typography>
                  <Typography>
                    {formatCurrency(selectedOrder.subtotal)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Delivery</Typography>
                  <Typography>
                    {formatCurrency(selectedOrder.delivery_fee)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: colors.forest,
                      fontSize: "1.05rem",
                    }}
                  >
                    Total
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: colors.forest,
                      fontSize: "1.05rem",
                    }}
                  >
                    {formatCurrency(selectedOrder.total)}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                p: 2,
                gap: 1,
              }}
            >
              <Button
                onClick={() => setSelectedOrder(null)}
                sx={{
                  color: colors.forest,
                  fontWeight: 600,
                }}
              >
                Close
              </Button>

              <Button
                variant="contained"
                onClick={updateOrderStatus}
                disabled={
                  updatingStatus ||
                  !newStatus ||
                  newStatus === selectedOrder?.status
                }
                sx={{
                  backgroundColor: colors.forest,
                  color: colors.cream,
                  fontWeight: 600,
                  borderRadius: "10px",
                  "&:hover": {
                    backgroundColor: "#0e261e",
                  },
                }}
              >
                {updatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </DialogActions>


          </>
        )}
      </Dialog>

    </Box >
  );
}

export default Orders;