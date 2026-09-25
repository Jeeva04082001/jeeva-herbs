import { Box, Container, Typography } from "@mui/material";
import { Truck, MapPin, Gift, CreditCard } from "lucide-react";
import { colors, fonts, sectionPad, RADIUS } from "../theme/brand";

const delivery = [
  { icon: Truck, title: "Dispatch", text: "Within 24 hours of order" },
  { icon: MapPin, title: "Delivery", text: "2–5 business days across Tamil Nadu" },
  { icon: Gift, title: "Free delivery", text: "On orders above ₹499" },
];

const payments = ["UPI", "PhonePe", "Google Pay", "Paytm", "Cards", "Cash on Delivery"];

function DeliverySection() {
  return (
    <Box component="section" sx={{ backgroundColor: colors.cream, ...sectionPad }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
            gap: { xs: 3, md: 4 },
          }}
        >
          {/* DELIVERY */}
          <Box
            sx={{
              border: `1px solid ${colors.line}`,
              borderRadius: RADIUS,
              p: { xs: 3, md: 4 },
              backgroundColor: "#fff",
            }}
          >
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontSize: "1.3rem",
                fontWeight: 600,
                color: colors.forest,
                mb: 3,
              }}
            >
              Delivery information
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2.5,
              }}
            >
              {delivery.map(({ icon: Icon, title, text }) => (
                <Box key={title}>
                  <Icon size={22} color={colors.moss} strokeWidth={1.6} />
                  <Typography sx={{ fontWeight: 600, color: colors.forest, mt: 1, fontSize: "0.92rem" }}>
                    {title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.85rem", color: colors.inkSoft, lineHeight: 1.6 }}>
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* PAYMENTS */}
          <Box
            sx={{
              border: `1px solid ${colors.line}`,
              borderRadius: RADIUS,
              p: { xs: 3, md: 4 },
              backgroundColor: colors.leafPale,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 2.5 }}>
              <CreditCard size={20} color={colors.moss} />
              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  color: colors.forest,
                }}
              >
                Payment methods
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {payments.map((method) => (
                <Typography
                  key={method}
                  sx={{
                    backgroundColor: colors.cream,
                    border: `1px solid ${colors.line}`,
                    borderRadius: "100px",
                    px: 1.8,
                    py: 0.7,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: colors.forest,
                  }}
                >
                  {method}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default DeliverySection;