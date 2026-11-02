import { Box, Container, Typography, Card, Grid } from "@mui/material";
import {
  Tags,
  Store,
  Users,
  ShoppingBag,
  ArrowRight,
  PackageSearch,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { colors, fonts } from "../../theme/brand";

const masterDataItems = [
  {
    title: "Customer Types",
    // description: "Create and manage customer categories.",
    path: "/admin/master-data/customer-types",
    icon: Tags,
  },
  {
    title: "Supermarkets",
    // description: "Add and manage supermarket details.",
    path: "/admin/master-data/supermarkets",
    icon: Store,
  },
  {
    title: "Customers",
    // description: "Add customers and manage their information.",
    path: "/admin/master-data/customers",
    icon: Users,
  },
  {
    title: "Customer Purchases",
    // description: "Record purchases and view customer purchase history.",
    path: "/admin/master-data/purchases",
    icon: ShoppingBag,
  },

  {
    title: "Customer Purchase History",
    description: "View customer orders and manage shipment tracking.",
    path: "/admin/master-data/purchase-history",
    icon: PackageSearch,
  },

  {
    title: "Courier Services",
    description: "Manage courier partners and tracking URLs.",
    path: "/admin/master-data/courier-services",
    icon: Truck,
  }
];

function MasterDataPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.creamDeep,
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Typography
          sx={{
            fontFamily: fonts.display,
            fontSize: "2rem",
            fontWeight: 600,
            color: colors.forest,
            mb: 1,
          }}
        >
          Manage Master Data
        </Typography>

        <Typography sx={{ color: colors.inkSoft, mb: 4 }}>
          Manage customers, customer types, supermarkets and external purchases.
        </Typography>

        <Grid container spacing={3}>
          {masterDataItems.map((item) => {
            const Icon = item.icon;

            return (
              <Grid item xs={12} sm={6} md={6} key={item.title}>
                <Card
                  component={Link}
                  to={item.path}
                  elevation={0}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 3,
                    minHeight: 150,
                    borderRadius: "16px",
                    border: `1px solid ${colors.line}`,
                    backgroundColor: "#FFFFFF",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      borderColor: colors.forest,
                    },
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 56,
                      width: 56,
                      height: 56,
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.creamDeep,
                      color: colors.forest,
                    }}
                  >
                    <Icon size={28} />
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: fonts.display,
                        fontSize: "1.15rem",
                        fontWeight: 600,
                        color: colors.forest,
                        mb: 0.8,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: colors.inkSoft,
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  <ArrowRight size={20} color={colors.forest} />
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}

export default MasterDataPage;