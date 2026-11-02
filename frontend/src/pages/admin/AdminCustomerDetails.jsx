import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  IconButton,
  Skeleton,
  Chip,
  Divider,
} from "@mui/material";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Store,
  ShoppingBag,
  CalendarDays,
  IndianRupee,
  Package,
} from "lucide-react";

import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";

const RADIUS = "16px";

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminCustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  async function fetchCustomer() {
    try {
      setLoading(true);
      setError("");

      const customerResponse = await api.get(
        `/api/admin/customers/${customerId}`
      );

      setCustomer(customerResponse.data);

      const purchaseResponse = await api.get(
        `/api/admin/customers/${customerId}/purchases`
      );

      setPurchases(purchaseResponse.data?.purchases || []);
    } catch (err) {
      console.error("Failed to load customer:", err);
      setError("Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: colors.creamDeep,
          py: 5,
        }}
      >
        <Container maxWidth="lg">
          <Skeleton width={180} height={40} />
          <Skeleton width={300} height={55} />
          <Card
            elevation={0}
            sx={{
              mt: 3,
              p: 3,
              border: `1px solid ${colors.line}`,
              borderRadius: RADIUS,
            }}
          >
            <Skeleton height={35} />
            <Skeleton height={25} />
            <Skeleton height={25} />
          </Card>
        </Container>
      </Box>
    );
  }

  if (error || !customer) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: colors.creamDeep,
          py: 5,
        }}
      >
        <Container maxWidth="lg">
          <Typography color="error">
            {error || "Customer not found"}
          </Typography>
        </Container>
      </Box>
    );
  }

  const totalPurchases = purchases.length;

  const totalPurchaseAmount = purchases.reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.creamDeep,
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        {/* BACK */}
        <IconButton
          onClick={() => navigate("/admin/customers")}
          sx={{
            mb: 2,
            backgroundColor: "#fff",
            border: `1px solid ${colors.line}`,
            borderRadius: "10px",
          }}
        >
          <ArrowLeft size={18} />
        </IconButton>

        {/* HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: colors.moss,
            }}
          >
            Customer
          </Typography>

          <Typography
            sx={{
              fontFamily: fonts.display,
              fontWeight: 600,
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              color: colors.forest,
            }}
          >
            {customer.name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mt: 1,
            }}
          >
            <Chip
              label={customer.customer_type?.name || "-"}
              sx={{
                backgroundColor: colors.leafPale,
                color: colors.forest,
                fontWeight: 700,
              }}
            />

            {customer.supermarket?.name && (
              <Chip
                icon={<Store size={15} />}
                label={customer.supermarket.name}
                sx={{
                  backgroundColor: "#fff",
                  border: `1px solid ${colors.line}`,
                  color: colors.forest,
                }}
              />
            )}
          </Box>
        </Box>

        {/* CUSTOMER INFORMATION */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: RADIUS,
            backgroundColor: "#fff",
            p: { xs: 2, md: 3 },
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: fonts.display,
              fontWeight: 600,
              fontSize: "1.15rem",
              color: colors.forest,
              mb: 2,
            }}
          >
            Customer Information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 2.5,
            }}
          >
            <InfoItem
              icon={<User size={17} />}
              label="Name"
              value={customer.name}
            />

            <InfoItem
              icon={<Phone size={17} />}
              label="Phone"
              value={customer.phone}
            />

            <InfoItem
              icon={<Mail size={17} />}
              label="Email"
              value={customer.email || "-"}
            />

            <InfoItem
              icon={<MapPin size={17} />}
              label="Address"
              value={[
                customer.address,
                customer.city,
                customer.state,
                customer.pincode,
              ]
                .filter(Boolean)
                .join(", ") || "-"}
            />

            <InfoItem
              icon={<Store size={17} />}
              label="Supermarket"
              value={customer.supermarket?.name || "-"}
            />

            <InfoItem
              icon={<CalendarDays size={17} />}
              label="Customer Since"
              value={formatDate(customer.created_at)}
            />
          </Box>
        </Card>

        {/* SUMMARY */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 2,
            mb: 2,
          }}
        >
          <SummaryCard
            icon={ShoppingBag}
            label="Purchases"
            value={totalPurchases}
          />

          <SummaryCard
            icon={IndianRupee}
            label="Purchase Value"
            value={formatCurrency(totalPurchaseAmount)}
          />

          <SummaryCard
            icon={Package}
            label="Items Bought"
            value={purchases.reduce(
              (sum, item) => sum + Number(item.quantity || 0),
              0
            )}
          />
        </Box>

        {/* PURCHASE HISTORY */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: RADIUS,
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: { xs: 2, md: 2.5 } }}>
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: "1.2rem",
                color: colors.forest,
              }}
            >
              Purchase History
            </Typography>
          </Box>

          <Divider />

          {purchases.length === 0 ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <ShoppingBag
                size={40}
                color={colors.moss}
              />

              <Typography
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                  color: colors.forest,
                }}
              >
                No purchases yet
              </Typography>
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Box sx={{ minWidth: 750 }}>
                {/* TABLE HEADER */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "1.1fr 2fr 1fr 0.7fr 1fr 1fr",
                    gap: 2,
                    px: 2.5,
                    py: 1.5,
                    backgroundColor: "#faf9f5",
                  }}
                >
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Product</TableHeader>
                  <TableHeader>Pack</TableHeader>
                  <TableHeader>Qty</TableHeader>
                  <TableHeader>Unit Price</TableHeader>
                  <TableHeader>Total</TableHeader>
                </Box>

                {purchases.map((purchase) => (
                  <Box
                    key={purchase.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "1.1fr 2fr 1fr 0.7fr 1fr 1fr",
                      gap: 2,
                      px: 2.5,
                      py: 1.8,
                      borderTop: `1px solid ${colors.line}`,
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {formatDate(purchase.purchase_date)}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: colors.forest,
                      }}
                    >
                      {purchase.product_name}
                    </Typography>

                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {purchase.variant_unit || "-"}
                    </Typography>

                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {purchase.quantity}
                    </Typography>

                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {formatCurrency(purchase.unit_price)}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: colors.forest,
                      }}
                    >
                      {formatCurrency(purchase.total_amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <Box sx={{ display: "flex", gap: 1.2 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "9px",
          backgroundColor: colors.leafPale,
          color: colors.moss,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: colors.inkSoft,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            fontSize: "0.84rem",
            color: colors.forest,
            mt: 0.2,
            wordBreak: "break-word",
          }}
        >
          {value || "-"}
        </Typography>
      </Box>
    </Box>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${colors.line}`,
        borderRadius: RADIUS,
        backgroundColor: "#fff",
        p: 2.2,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          backgroundColor: colors.leafPale,
          color: colors.moss,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1.2,
        }}
      >
        <Icon size={17} />
      </Box>

      <Typography
        sx={{
          fontSize: "0.72rem",
          color: colors.inkSoft,
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontFamily: fonts.display,
          fontSize: "1.35rem",
          fontWeight: 700,
          color: colors.forest,
          mt: 0.3,
        }}
      >
        {value}
      </Typography>
    </Card>
  );
}

function TableHeader({ children }) {
  return (
    <Typography
      sx={{
        fontSize: "0.64rem",
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: colors.inkSoft,
      }}
    >
      {children}
    </Typography>
  );
}

export default AdminCustomerDetails;



