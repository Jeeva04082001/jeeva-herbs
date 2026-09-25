import { Box, Container, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { colors, fonts } from "../theme/brand";
import { sectionLinks, useSectionNav } from "../hooks/useSectionNav";

const quickLinks = [
  { label: "Products", to: "/products" },
  { label: "Cart", to: "/cart" },
  { label: "Account", to: "/account" },
];

function Footer() {
  // Same navigation as the Navbar: works from any route, lands below the sticky bar
  const { goToSection } = useSectionNav();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#0e261e",
        color: colors.cream,
        pt: { xs: 5, md: 7 },
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr 1fr" },
            gap: { xs: 4, md: 6 },
            pb: 4,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.3rem" }}>
              Jeeva{" "}
              <Box
                component="span"
                sx={{ color: colors.gold, fontStyle: "italic", fontWeight: 500 }}
              >
                herbal
              </Box>
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                fontFamily: fonts.display,
                fontStyle: "italic",
                color: "rgba(247,241,227,0.72)",
                maxWidth: 320,
                lineHeight: 1.7,
              }}
            >
              Nature's goodness in every sip — herbal soup premix made the traditional way.
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: "0.9rem" }}>Shop</Typography>
            {quickLinks.map((link) => (
              <Typography
                key={link.label}
                component={Link}
                to={link.to}
                sx={{
                  display: "block",
                  color: "rgba(247,241,227,0.72)",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  mb: 1,
                  "&:hover": { color: colors.gold },
                }}
              >
                {link.label}
              </Typography>
            ))}
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1.5, fontSize: "0.9rem" }}>
              This page
            </Typography>
            {sectionLinks.map((link) => (
              <Button
                key={link.id}
                onClick={() => goToSection(link.id)}
                sx={{
                  display: "block",
                  textAlign: "left",
                  minWidth: 0,
                  p: 0,
                  mb: 1,
                  color: "rgba(247,241,227,0.72)",
                  fontSize: "0.88rem",
                  fontWeight: 400,
                  textTransform: "none",
                  "&:hover": { color: colors.gold, backgroundColor: "transparent" },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            borderTop: "1px solid rgba(201,154,62,0.25)",
            pt: 2.5,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", color: "rgba(247,241,227,0.6)" }}>
            © {new Date().getFullYear()} Jeeva Herbal Soup Premix. All rights reserved.
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "rgba(247,241,227,0.6)" }}>
            Made in Tamil Nadu
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;