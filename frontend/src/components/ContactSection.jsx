import { Box, Container, Typography, Button } from "@mui/material";
import { MessageCircle, Phone } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "./Socialicons";
import SectionHeader from "./SectionHeader";
import {
  colors,
  sectionPad,
  waLink,
  PHONE_NUMBER,
  INSTAGRAM_HANDLE,
} from "../theme/brand";

function ContactSection() {
  const channels = [
    { icon: Phone, label: "Call us", value: PHONE_NUMBER, href: `tel:${PHONE_NUMBER}` },
    {
      icon: InstagramIcon,
      label: "Instagram",
      value: INSTAGRAM_HANDLE,
      href: `https://instagram.com/${INSTAGRAM_HANDLE.replace("@", "")}`,
    },
    { icon: YoutubeIcon, label: "YouTube", value: "Jeeva Herbal", href: "#" },
  ];

  return (
    <Box component="section" id="contact" sx={{ backgroundColor: colors.forest, ...sectionPad }}>
      <Container maxWidth="md">
        <SectionHeader
          eyebrow="Get in Touch"
          title="Order Jeeva for your home today"
          subtitle="Reach out on WhatsApp for the fastest response, or give us a call. We're happy to help you pick the right variant."
          tone="light"
        />

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", mb: 5 }}>
          <Button
            component="a"
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            startIcon={<MessageCircle size={18} />}
            sx={{
              backgroundColor: colors.gold,
              color: colors.forest,
              px: 3.5,
              py: 1.3,
              borderRadius: "100px",
              fontWeight: 700,
              "&:hover": { backgroundColor: "#b3862f" },
            }}
          >
            Chat on WhatsApp
          </Button>

          <Button
            component="a"
            href={`tel:${PHONE_NUMBER}`}
            variant="outlined"
            startIcon={<Phone size={18} />}
            sx={{
              borderColor: "rgba(247,241,227,0.4)",
              color: colors.cream,
              px: 3.5,
              py: 1.3,
              borderRadius: "100px",
              fontWeight: 600,
              "&:hover": {
                borderColor: colors.cream,
                backgroundColor: "rgba(247,241,227,0.08)",
              },
            }}
          >
            Call {PHONE_NUMBER}
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {channels.map(({ icon: Icon, label, value, href }) => (
            <Box
              component="a"
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              sx={{
                textDecoration: "none",
                border: "1px solid rgba(201,154,62,0.3)",
                borderRadius: "18px",
                p: 2.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": { backgroundColor: "rgba(247,241,227,0.06)" },
              }}
            >
              <Icon size={20} color={colors.gold} />
              <Box>
                <Typography sx={{ fontSize: "0.78rem", color: "rgba(247,241,227,0.65)" }}>
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 600, color: colors.cream, fontSize: "0.9rem" }}>
                  {value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default ContactSection;