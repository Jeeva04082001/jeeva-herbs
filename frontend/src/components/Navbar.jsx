import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  IconButton,
  Box,
  Drawer,
  Divider,
} from "@mui/material";
import { ShoppingCart, LogOut, User, Menu, X, Store } from "lucide-react";
import { colors } from "../theme/brand";
import { sectionLinks, useSectionNav } from "../hooks/useSectionNav";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const [drawerOpen, setDrawerOpen] = useState(false);
  // observe: true — this is the one component that tracks the active section
  const { goToSection, activeSection, isHome } = useSectionNav({ observe: true });

  async function handleLogout() {
    await logout();
    setDrawerOpen(false);
    navigate("/");
  }

  function handleSectionClick(id) {
    goToSection(id);
    setDrawerOpen(false);
  }

  const logo = (
    <Typography
      component={Link}
      to="/"
      sx={{ fontWeight: 700, fontSize: "1.3rem", color: colors.cream, textDecoration: "none" }}
    >
      Jeeva{" "}
      <Box component="span" sx={{ color: colors.gold, fontStyle: "italic", fontWeight: 500 }}>
        herbs
      </Box>
    </Typography>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          backgroundColor: colors.forest,
          borderBottom: "1px solid rgba(201,154,62,0.25)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 }, py: 1, gap: 2 }}>
          {logo}

          {/* DESKTOP — SECTION LINKS */}
          <Box
            component="nav"
            sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 0.5 }}
          >
            {sectionLinks.map((link) => {
              const isActive = isHome && activeSection === link.id;
              return (
                <Button
                  key={link.id}
                  onClick={() => handleSectionClick(link.id)}
                  sx={{
                    color: isActive ? colors.gold : colors.cream,
                    fontSize: "0.88rem",
                    fontWeight: isActive ? 700 : 500,
                    px: 1.4,
                    minWidth: 0,
                    borderBottom: "2px solid",
                    borderRadius: 0,
                    borderColor: isActive ? colors.gold : "transparent",
                    "&:hover": { backgroundColor: "rgba(247,241,227,0.08)" },
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          {/* RIGHT — ACCOUNT ACTIONS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1.5 } }}>
            <Button
              component={Link}
              to="/products"
              startIcon={<Store size={17} />}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                color: colors.cream,
                fontSize: "0.88rem",
              }}
            >
              Shop
            </Button>

            <IconButton component={Link} to="/cart" sx={{ color: colors.cream }} aria-label="Cart">
              <Badge badgeContent={cartCount} color="warning">
                <ShoppingCart size={20} />
              </Badge>
            </IconButton>

            {/* Auth buttons live in the drawer on small screens */}
            <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1.5 }}>
              {isAuthenticated ? (
                <>
                  {user?.is_staff ? (
                    <Button
                      component={Link}
                      to="/admin"
                      onClick={() => setDrawerOpen(false)}
                      fullWidth
                      startIcon={<Store size={17} />}
                      sx={{
                        justifyContent: "flex-start",
                        color: colors.gold,
                        py: 1.1,
                        fontWeight: 600,
                      }}
                    >
                      Admin Dashboard
                    </Button>
                  ) : (
                    <Button
                      component={Link}
                      to="/account"
                      onClick={() => setDrawerOpen(false)}
                      fullWidth
                      startIcon={<User size={17} />}
                      sx={{
                        justifyContent: "flex-start",
                        color: colors.cream,
                        py: 1.1,
                      }}
                    >
                      My Account
                    </Button>
                  )}

                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    startIcon={<LogOut size={16} />}
                    sx={{
                      color: colors.cream,
                      borderColor: "rgba(247,241,227,0.3)",
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{ color: colors.cream, fontSize: "0.88rem" }}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="contained"
                    sx={{
                      backgroundColor: colors.gold,
                      color: colors.forest,
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#b3862f" },
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>

            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              sx={{ display: { lg: "none" }, color: colors.cream }}
            >
              <Menu size={22} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 286, backgroundColor: colors.forest, color: colors.cream, p: 2.5 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          {logo}
          <IconButton
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            sx={{ color: colors.cream }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        <Typography
          sx={{
            fontSize: "0.72rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(247,241,227,0.5)",
            mb: 1,
          }}
        >
          On this page
        </Typography>

        {sectionLinks.map((link) => (
          <Button
            key={link.id}
            onClick={() => handleSectionClick(link.id)}
            fullWidth
            sx={{
              justifyContent: "flex-start",
              color: isHome && activeSection === link.id ? colors.gold : colors.cream,
              py: 1.1,
              fontSize: "0.95rem",
            }}
          >
            {link.label}
          </Button>
        ))}

        <Divider sx={{ my: 2, borderColor: "rgba(201,154,62,0.25)" }} />

        <Button
          component={Link}
          to="/products"
          onClick={() => setDrawerOpen(false)}
          fullWidth
          startIcon={<Store size={17} />}
          sx={{ justifyContent: "flex-start", color: colors.cream, py: 1.1 }}
        >
          Shop all products
        </Button>

        {isAuthenticated ? (
          <>
            <Button
              component={Link}
              to="/account"
              onClick={() => setDrawerOpen(false)}
              fullWidth
              startIcon={<User size={17} />}
              sx={{ justifyContent: "flex-start", color: colors.cream, py: 1.1 }}
            >
              {user?.name || "Account"}
            </Button>

            {user?.is_staff && (
              <Button
                component={Link}
                to="/admin"
                startIcon={<Store size={17} />}
                sx={{
                  color: colors.gold,
                  fontSize: "0.88rem",
                  fontWeight: 600,
                }}
              >
                Admin
              </Button>
            )}

            <Button
              onClick={handleLogout}
              fullWidth
              variant="outlined"
              startIcon={<LogOut size={16} />}
              sx={{ mt: 2, color: colors.cream, borderColor: "rgba(247,241,227,0.3)" }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2 }}>
            <Button
              component={Link}
              to="/login"
              onClick={() => setDrawerOpen(false)}
              variant="outlined"
              sx={{ color: colors.cream, borderColor: "rgba(247,241,227,0.3)" }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              onClick={() => setDrawerOpen(false)}
              variant="contained"
              sx={{
                backgroundColor: colors.gold,
                color: colors.forest,
                fontWeight: 600,
                "&:hover": { backgroundColor: "#b3862f" },
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}

export default Navbar;