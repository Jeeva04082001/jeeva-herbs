import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  IconButton,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  Clock,
  AlertTriangle,
  RefreshCw,
  ClipboardList,
  ArrowRight,
  Database,
  Headset,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";

// Slightly tighter radius than the storefront's 22px — reads as a tool, not a shop.
const ADMIN_RADIUS = "16px";

/** One stat tile. alert="warn" tints it amber when the number needs attention. */
function StatCard({ icon: Icon, label, value, loading, alert }) {
  const isWarning = alert === "warn";

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${isWarning ? "rgba(201,154,62,0.4)" : colors.line}`,
        borderRadius: ADMIN_RADIUS,
        p: 2.5,
        backgroundColor: isWarning ? "rgba(201,154,62,0.06)" : "#fff",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isWarning ? "rgba(201,154,62,0.18)" : colors.leafPale,
            color: isWarning ? colors.clay : colors.moss,
            flexShrink: 0,
          }}
        >
          <Icon size={17} strokeWidth={2} />
        </Box>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: colors.inkSoft }}>
          {label}
        </Typography>
      </Box>

      {loading ? (
        <Skeleton variant="text" width={64} height={40} sx={{ fontSize: "1.9rem" }} />
      ) : (
        <Typography
          sx={{
            fontFamily: fonts.display,
            fontSize: "1.9rem",
            fontWeight: 700,
            color: isWarning ? colors.clay : colors.forest,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      )}
    </Card>
  );
}

const quickActions = [
  { label: "Manage Products", to: "/products", icon: Package },
  { label: "Manage Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "View Customers", to: "/admin/customers", icon: Users },
  { label: "Manage Reviews", to: "/admin/reviews", icon: ClipboardList },
  { label: "Manage Master Data", to: "/admin/master-data", icon: Database  },
  { label: "Manage Support Tickets", to: "/admin/support-tickets", icon: Headset },
];

function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_customers: 0,
    revenue: 0,
    low_stock_products: 0,
    pending_orders: 0,
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/dashboard");
      setStats(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const revenueDisplay = loading
    ? null
    : `₹${Number(stats.revenue).toLocaleString("en-IN")}`;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: colors.creamDeep, py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
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
              Overview
            </Typography>
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                color: colors.forest,
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: colors.inkSoft, mt: 0.5 }}>
              Welcome, {user?.name || user?.email}
              {lastUpdated && (
                <Box
                  component="span"
                  sx={{ color: colors.inkSoft, opacity: 0.7 }}
                >
                  {" "}
                  · updated{" "}
                  {lastUpdated.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Box>
              )}
            </Typography>
          </Box>

          <Tooltip title="Refresh">
            <span>
              <IconButton
                onClick={fetchDashboard}
                disabled={loading}
                sx={{
                  backgroundColor: colors.forest,
                  color: colors.cream,
                  borderRadius: "10px",
                  p: 1.2,
                  "&:hover": { backgroundColor: "#0e261e" },
                  "&.Mui-disabled": { backgroundColor: colors.forest, opacity: 0.6 },
                }}
              >
                <RefreshCw
                  size={18}
                  style={{
                    animation: loading ? "adminSpin 0.9s linear infinite" : "none",
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          {/* keyframes for the spin above — scoped here, not a separate stylesheet */}
          <Box
            sx={{
              "@keyframes adminSpin": {
                from: { transform: "rotate(0deg)" },
                to: { transform: "rotate(360deg)" },
              },
            }}
          />
        </Box>

        {/* PRIMARY STATS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 2,
            mb: 2,
          }}
        >
          <StatCard icon={Package} label="Products" value={stats.total_products} loading={loading} />
          <StatCard icon={ShoppingCart} label="Orders" value={stats.total_orders} loading={loading} />
          <StatCard icon={Users} label="Customers" value={stats.total_customers} loading={loading} />
          <StatCard
            icon={IndianRupee}
            label="Revenue"
            value={revenueDisplay}
            loading={loading}
          />
        </Box>

        {/* SECONDARY STATS — tinted amber once there's something to act on */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(2, 1fr)" },
            gap: 2,
            mb: 5,
            maxWidth: { md: 480 },
          }}
        >
          <StatCard
            icon={Clock}
            label="Pending Orders"
            value={stats.pending_orders}
            loading={loading}
            alert={!loading && stats.pending_orders > 0 ? "warn" : undefined}
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock"
            value={stats.low_stock_products}
            loading={loading}
            alert={!loading && stats.low_stock_products > 0 ? "warn" : undefined}
          />
        </Box>

        {/* QUICK ACTIONS */}
        <Typography
          sx={{
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: "1.15rem",
            color: colors.forest,
            mb: 2,
          }}
        >
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Button
              key={to}
              component={Link}
              to={to}
              endIcon={<ArrowRight size={16} />}
              startIcon={<Icon size={18} />}
              sx={{
                justifyContent: "space-between",
                textAlign: "left",
                backgroundColor: "#fff",
                border: `1px solid ${colors.line}`,
                borderRadius: ADMIN_RADIUS,
                color: colors.forest,
                fontWeight: 600,
                fontSize: "0.92rem",
                py: 1.6,
                px: 2.2,
                "&:hover": {
                  backgroundColor: colors.leafPale,
                  borderColor: colors.moss,
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default AdminDashboard;