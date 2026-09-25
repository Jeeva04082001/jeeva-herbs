import { useState } from "react";
import { Box, Typography, Fab, Zoom } from "@mui/material";
import { MessageCircle, Phone, X } from "lucide-react";
import { colors, waLink, PHONE_NUMBER } from "../theme/brand";

/** Floating help button, bottom-right on every page. */
function WhatsAppButton() {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: waLink(),
      external: true,
      bg: "#25D366",
    },
    { label: "Call", icon: Phone, href: `tel:${PHONE_NUMBER}`, external: false, bg: colors.forest },
  ];

  return (
    <Box
      sx={{
        position: "fixed",
        right: { xs: 16, md: 24 },
        bottom: { xs: 16, md: 24 },
        zIndex: 1200,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 1.5,
      }}
    >
      {actions.map(({ label, icon: Icon, href, external, bg }, index) => (
        <Zoom in={open} key={label} style={{ transitionDelay: open ? `${index * 60}ms` : "0ms" }}>
          <Box
            component="a"
            href={href}
            target={external ? "_blank" : undefined}
            rel="noopener noreferrer"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              backgroundColor: bg,
              color: "#fff",
              borderRadius: "100px",
              pl: 2,
              pr: 1.2,
              py: 1,
              boxShadow: "0 6px 18px rgba(20,52,42,0.18)",
            }}
          >
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{label}</Typography>
            <Icon size={18} />
          </Box>
        </Zoom>
      ))}

      <Fab
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close contact options" : "Contact Jeeva Herbal"}
        sx={{
          backgroundColor: open ? colors.forest : "#25D366",
          color: "#fff",
          "&:hover": { backgroundColor: open ? "#0e261e" : "#1ebe5a" },
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </Fab>
    </Box>
  );
}

export default WhatsAppButton;