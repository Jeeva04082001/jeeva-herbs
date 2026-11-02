import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  IconButton,
  Tooltip,
  Skeleton,
  TextField,
  InputAdornment,
  Chip,
  Button,
} from "@mui/material";

import {
  Users,
  RefreshCw,
  Search,
  Mail,
  ShoppingBag,
  IndianRupee,
  CalendarDays,
} from "lucide-react";

import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";
import { useNavigate } from "react-router-dom";


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

function getInitials(name) {
  if (!name) return "C";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function AdminCustomers() {

  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter((customer) => {
      return (
        customer.name?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
      );
    });

    setFilteredCustomers(filtered);
  }, [search, customers]);

  async function fetchCustomers() {
    try {
      setLoading(true);

      const response = await api.get("/api/admin/customers");

      setCustomers(response.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.creamDeep,
        py: { xs: 3, md: 5 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          maxWidth: "1400px !important",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                color: colors.moss,
                mb: 0.5,
              }}
            >
              Admin
            </Typography>

            <Typography
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: {
                  xs: "1.8rem",
                  sm: "2.1rem",
                  md: "2.4rem",
                },
                color: colors.forest,
                lineHeight: 1.1,
              }}
            >
              Customers
            </Typography>

            <Typography
              sx={{
                fontSize: "0.88rem",
                color: colors.inkSoft,
                mt: 0.6,
              }}
            >
              View and manage your registered customers.
              {lastUpdated && (
                <Box
                  component="span"
                  sx={{
                    ml: 0.7,
                    opacity: 0.65,
                  }}
                >
                  · Updated{" "}
                  {lastUpdated.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Box>
              )}
            </Typography>
          </Box>

          {/* REFRESH */}
          <Tooltip title="Refresh customers">
            <span>
              <IconButton
                onClick={fetchCustomers}
                disabled={loading}
                sx={{
                  width: 44,
                  height: 44,
                  backgroundColor: colors.forest,
                  color: colors.cream,
                  borderRadius: "11px",

                  "&:hover": {
                    backgroundColor: "#0e261e",
                  },

                  "&.Mui-disabled": {
                    backgroundColor: colors.forest,
                    color: colors.cream,
                    opacity: 0.55,
                  },
                }}
              >
                <RefreshCw
                  size={18}
                  style={{
                    animation: loading
                      ? "customerSpin 0.9s linear infinite"
                      : "none",
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* SEARCH + SUMMARY */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: RADIUS,
            backgroundColor: "#fff",
            p: { xs: 1.5, sm: 2 },
            mb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              justifyContent: "space-between",
              alignItems: {
                xs: "stretch",
                sm: "center",
              },
              gap: 1.5,
            }}
          >
            {/* SEARCH */}
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone or email..."
              size="small"
              fullWidth
              sx={{
                maxWidth: {
                  sm: 420,
                },

                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#faf9f5",
                  fontSize: "0.85rem",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={17} color={colors.inkSoft} />
                  </InputAdornment>
                ),
              }}
            />

            {/* CUSTOMER COUNT */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                color: colors.inkSoft,
                flexShrink: 0,
              }}
            >
              <Users size={16} />

              <Typography
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                }}
              >
                {loading
                  ? "Loading..."
                  : `${filteredCustomers.length} customer${filteredCustomers.length === 1 ? "" : "s"
                  }`}
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* LOADING */}
        {loading ? (
          <Box
            sx={{
              display: "grid",
              gap: 1.2,
            }}
          >
            {[1, 2, 3, 4].map((item) => (
              <Card
                key={item}
                elevation={0}
                sx={{
                  border: `1px solid ${colors.line}`,
                  borderRadius: RADIUS,
                  backgroundColor: "#fff",
                  p: 2,
                }}
              >
                <Skeleton variant="text" width="25%" />
                <Skeleton variant="text" width="45%" />
                <Skeleton variant="text" width="30%" />
              </Card>
            ))}
          </Box>
        ) : filteredCustomers.length === 0 ? (
          /* EMPTY */
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${colors.line}`,
              borderRadius: RADIUS,
              backgroundColor: "#fff",
              p: { xs: 4, md: 6 },
              textAlign: "center",
            }}
          >
            <Users
              size={42}
              color={colors.moss}
            />

            <Typography
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: "1.3rem",
                color: colors.forest,
                mt: 1.5,
              }}
            >
              {search
                ? "No customers found"
                : "No customers yet"}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.85rem",
                color: colors.inkSoft,
                mt: 0.5,
              }}
            >
              {search
                ? "Try another name or email."
                : "Registered customers will appear here."}
            </Typography>
          </Card>
        ) : (
          /* CUSTOMER LIST */
          <Box
            sx={{
              display: "grid",
              gap: 1.2,
            }}
          >
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                elevation={0}
                sx={{
                  border: `1px solid ${colors.line}`,
                  borderRadius: RADIUS,
                  backgroundColor: "#fff",
                  overflow: "hidden",

                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease",

                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow:
                      "0 7px 20px rgba(20,52,42,0.07)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1.5fr 1.5fr 1fr 1fr 0.7fr 0.8fr 1fr",
                    },

                    alignItems: "center",

                    gap: {
                      xs: 1.5,
                      md: 2,
                    },

                    px: {
                      xs: 1.5,
                      sm: 2,
                      md: 2.2,
                    },

                    py: {
                      xs: 1.5,
                      md: 1.7,
                    },
                  }}
                >
                  {/* CUSTOMER */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      minWidth: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "12px",
                        backgroundColor: colors.leafPale,
                        color: colors.forest,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: "0.8rem",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(customer.name)}
                    </Box>

                    <Box
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.64rem",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          color: colors.inkSoft,
                          mb: 0.2,
                        }}
                      >
                        CUSTOMER
                      </Typography>

                      <Typography
                        sx={{
                          fontWeight: 750,
                          fontSize: "0.9rem",
                          color: colors.forest,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={customer.name}
                      >
                        {customer.name || "-"}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          color: colors.inkSoft,
                          mt: 0.15,
                        }}
                      >
                        {customer.phone || "-"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* EMAIL */}
                  <Box
                    sx={{
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: colors.inkSoft,
                        mb: 0.25,
                      }}
                    >
                      EMAIL
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        minWidth: 0,
                      }}
                    >
                      <Mail
                        size={14}
                        color={colors.moss}
                        style={{
                          flexShrink: 0,
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: "0.78rem",
                          color: colors.forest,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={customer.email}
                      >
                        {customer.email || "-"}
                      </Typography>
                    </Box>
                  </Box>


                  {/* CUSTOMER TYPE */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: colors.inkSoft,
                        mb: 0.5,
                      }}
                    >
                      TYPE
                    </Typography>

                    <Chip
                      label={customer.customer_type?.name || "-"}
                      size="small"
                      sx={{
                        height: 26,
                        borderRadius: "8px",
                        backgroundColor: colors.leafPale,
                        color: colors.forest,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  {/* SUPERMARKET */}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: colors.inkSoft,
                        mb: 0.25,
                      }}
                    >
                      SUPERMARKET
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        color: colors.forest,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={customer.supermarket?.name || ""}
                    >
                      {customer.supermarket?.name || "-"}
                    </Typography>
                  </Box>

                  {/* ORDERS */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: colors.inkSoft,
                        mb: 0.25,
                      }}
                    >
                      ORDERS
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.45,
                      }}
                    >
                      <ShoppingBag
                        size={14}
                        color={colors.moss}
                      />

                      <Typography
                        sx={{
                          fontWeight: 750,
                          fontSize: "0.9rem",
                          color: colors.forest,
                        }}
                      >
                        {customer.total_orders || 0}
                      </Typography>
                    </Box>
                  </Box>

                  {/* SPENT */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: colors.inkSoft,
                        mb: 0.25,
                      }}
                    >
                      SPENT
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.2,
                      }}
                    >
                      <IndianRupee
                        size={13}
                        color={colors.moss}
                      />

                      <Typography
                        sx={{
                          fontWeight: 750,
                          fontSize: "0.88rem",
                          color: colors.forest,
                        }}
                      >
                        {Number(
                          customer.total_spent || 0
                        ).toLocaleString("en-IN")}
                      </Typography>
                    </Box>
                  </Box>

                  {/* JOINED */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.64rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: colors.inkSoft,
                        mb: 0.25,
                      }}
                    >
                      JOINED
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <CalendarDays
                        size={14}
                        color={colors.moss}
                      />

                      <Typography
                        sx={{
                          fontSize: "0.76rem",
                          color: colors.forest,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(
                          customer.created_at
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {/* VIEW DETAILS */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(`/admin/customers/${customer.id}`)}
                    sx={{
                      borderColor: colors.line,
                      color: colors.forest,
                      borderRadius: "9px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "none",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        borderColor: colors.moss,
                        backgroundColor: colors.leafPale,
                      },
                    }}
                  >
                    View Details
                  </Button>

                  
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {/* SPIN ANIMATION */}
      <Box
        sx={{
          "@keyframes customerSpin": {
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
  );
}

export default AdminCustomers;