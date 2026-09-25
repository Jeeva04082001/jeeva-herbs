import { Box, Container, Typography } from "@mui/material";
import SectionHeader from "./SectionHeader";
import { colors, fonts, sectionPad } from "../theme/brand";

const promises = [
  { value: "100%", title: "Natural", text: "Every ingredient sourced from nature, nothing synthetic." },
  { value: "✓", title: "Homemade", text: "Small-batch prepared with the same care as home cooking." },
  { value: "0", title: "Preservatives", text: "No preservatives added, ever." },
  { value: "0", title: "Artificial Colours", text: "What you see is what nature gave." },
  { value: "0", title: "Artificial Flavours", text: "Real herbs and spices, real taste." },
  { value: "100+", title: "Yrs of Tradition", text: "A recipe passed down, not manufactured." },
];

function WhyJeeva() {
  return (
    <Box component="section" id="why" sx={{ backgroundColor: colors.forest, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader
          eyebrow="Why Trust Jeeva"
          title="Six promises, kept every batch"
          tone="light"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: { xs: 2, md: 3 },
          }}
        >
          {promises.map((item) => (
            <Box
              key={item.title}
              sx={{
                backgroundColor: "rgba(247,241,227,0.06)",
                border: "1px solid rgba(201,154,62,0.25)",
                borderRadius: "20px",
                p: { xs: 2.5, md: 3 },
              }}
            >
              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: { xs: "1.8rem", md: "2.2rem" },
                  fontWeight: 700,
                  color: colors.gold,
                  lineHeight: 1,
                  mb: 1.5,
                }}
              >
                {item.value}
              </Typography>
              <Typography sx={{ fontWeight: 600, color: colors.cream, mb: 0.5 }}>
                {item.title}
              </Typography>
              <Typography
                sx={{ fontSize: "0.85rem", color: "rgba(247,241,227,0.7)", lineHeight: 1.6 }}
              >
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default WhyJeeva;