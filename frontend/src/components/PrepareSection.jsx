import { Box, Container, Typography } from "@mui/material";
import { Droplets, Utensils, Flame, Coffee } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { colors, cardSx, sectionPad } from "../theme/brand";

const steps = [
  { icon: Droplets, title: "Boil Water", text: "Boil 2 cups of water in a saucepan." },
  { icon: Utensils, title: "Add Premix", text: "Add 2 spoons of Jeeva Soup Premix." },
  { icon: Flame, title: "Simmer", text: "Boil for 5–10 minutes, stirring occasionally." },
  { icon: Coffee, title: "Serve Hot", text: "Pour into a bowl and serve hot." },
];

function PrepareSection() {
  return (
    <Box component="section" id="prepare" sx={{ backgroundColor: colors.cream, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="How to Prepare" title="Ready in four simple steps" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: { xs: 2, md: 3 },
          }}
        >
          {steps.map(({ icon: Icon, title, text }, index) => (
            <Box key={title} sx={{ ...cardSx, position: "relative", pt: 4 }}>
              <Box
                sx={{
                  position: "absolute",
                  top: -16,
                  left: 24,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  backgroundColor: colors.forest,
                  color: colors.cream,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {index + 1}
              </Box>

              <Box sx={{ color: colors.moss, mb: 1.5 }}>
                <Icon size={26} strokeWidth={1.6} />
              </Box>
              <Typography sx={{ fontWeight: 600, color: colors.forest, mb: 0.5 }}>
                {title}
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", color: colors.inkSoft, lineHeight: 1.6 }}>
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default PrepareSection;