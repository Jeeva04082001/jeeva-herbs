import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Divider,
} from "@mui/material";
import {
  User,
  MapPin,
  Package,
  ChevronRight,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { colors, fonts } from "../theme/brand";

function Account() {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.creamDeep,
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">

        {/* HEADER */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: colors.moss,
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            My Account
          </Typography>

          <Typography
            sx={{
              fontFamily: fonts.display,
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 600,
              color: colors.forest,
            }}
          >
            Welcome, {user?.name || user?.email}
          </Typography>

          <Typography
            sx={{
              color: colors.inkSoft,
              mt: 0.5,
            }}
          >
            Manage your account, addresses and orders.
          </Typography>
        </Box>

        {/* PROFILE */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: "16px",
            backgroundColor: "#fff",
            p: { xs: 2.5, md: 3 },
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                backgroundColor: colors.leafPale,
                color: colors.forest,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={23} />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: colors.forest,
                }}
              >
                {user?.name || "Customer"}
              </Typography>

              <Typography
                sx={{
                  color: colors.inkSoft,
                  fontSize: "0.9rem",
                }}
              >
                {user?.email}
              </Typography>

              {user?.phone && (
                <Typography
                  sx={{
                    color: colors.inkSoft,
                    fontSize: "0.9rem",
                  }}
                >
                  {user.phone}
                </Typography>
              )}
            </Box>
          </Box>
        </Card>

        {/* ACCOUNT OPTIONS */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: "16px",
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >

          {/* MY ORDERS */}
          <Button
            component={Link}
            to="/orders"
            fullWidth
            sx={{
              justifyContent: "space-between",
              textAlign: "left",
              color: colors.forest,
              textTransform: "none",
              p: 2.5,
              borderRadius: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  backgroundColor: colors.leafPale,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Package size={20} />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  My Orders
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: colors.inkSoft,
                  }}
                >
                  View and track your orders
                </Typography>
              </Box>
            </Box>

            <ChevronRight size={20} />
          </Button>

          <Divider />

          {/* ADDRESSES */}
          <Button
            component={Link}
            to="/account/addresses"
            fullWidth
            sx={{
              justifyContent: "space-between",
              textAlign: "left",
              color: colors.forest,
              textTransform: "none",
              p: 2.5,
              borderRadius: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  backgroundColor: colors.leafPale,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={20} />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  My Addresses
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: colors.inkSoft,
                  }}
                >
                  Manage your delivery addresses
                </Typography>
              </Box>
            </Box>

            <ChevronRight size={20} />
          </Button>

        </Card>

      </Container>
    </Box>
  );
}

export default Account;