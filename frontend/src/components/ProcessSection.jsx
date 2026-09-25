import { Box, Container, Typography } from "@mui/material";
import { Sprout, Sun, Flame, Disc3, Package, Home } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { colors, sectionPad } from "../theme/brand";

const steps = [
  { icon: Sprout, title: "Fresh Herbs", text: "Hand-picked at peak freshness" },
  { icon: Sun, title: "Sun Dried", text: "Naturally dried, no shortcuts" },
  { icon: Flame, title: "Roasted", text: "Slow-roasted for full flavour" },
  { icon: Disc3, title: "Stone Ground", text: "Ground the traditional way" },
  { icon: Package, title: "Hygienically Packed", text: "Sealed fresh, batch by batch" },
  { icon: Home, title: "Delivered Home", text: "Straight to your kitchen" },
];

function ProcessSection() {
  return (
    <Box component="section" id="process" sx={{ backgroundColor: colors.creamDeep, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="Our Process" title="From the field to your bowl" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(6, 1fr)",
            },
            gap: { xs: 2, md: 1.5 },
          }}
        >
          {steps.map(({ icon: Icon, title, text }, index) => (
            <Box key={title} sx={{ position: "relative", textAlign: "center", px: 0.5 }}>
              <Box
                sx={{
                  width: 62,
                  height: 62,
                  mx: "auto",
                  mb: 1.5,
                  borderRadius: "50%",
                  backgroundColor: colors.cream,
                  border: `1px solid ${colors.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: colors.moss,
                }}
              >
                <Icon size={24} strokeWidth={1.6} />
              </Box>

              {/* Step number — this content really is a sequence, so numbering earns its place */}
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: colors.leaf,
                  mb: 0.5,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </Typography>

              <Typography sx={{ fontWeight: 600, color: colors.forest, fontSize: "0.95rem" }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: "0.8rem", color: colors.inkSoft, mt: 0.5 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default ProcessSection;