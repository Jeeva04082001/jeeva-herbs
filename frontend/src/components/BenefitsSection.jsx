import { Box, Container, Typography } from "@mui/material";
import { Check } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { colors, fonts, cardSx, sectionPad } from "../theme/brand";

const herbs = [
  {
    name: "Murungai",
    tamil: "முருங்கை",
    points: ["Supports iron levels", "Supports calcium intake", "Supports immunity"],
  },
  {
    name: "Modakathan",
    tamil: "முடக்கத்தான்",
    points: ["Supports joint health", "Supports digestion", "Supports overall mobility"],
  },
  {
    name: "Thoothuvalai",
    tamil: "தூதுவளை",
    points: [
      "Supports cold & cough relief",
      "Supports respiratory comfort",
      "Supports seasonal immunity",
    ],
  },
];

function BenefitsSection() {
  return (
    <Box component="section" id="benefits" sx={{ backgroundColor: colors.creamDeep, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="Health Benefits" title="Traditional herbs, everyday wellness" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {herbs.map((herb) => (
            <Box key={herb.name} sx={cardSx}>
              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: colors.forest,
                }}
              >
                {herb.name}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: colors.leaf, mb: 2 }}>
                {herb.tamil}
              </Typography>

              {herb.points.map((point) => (
                <Box key={point} sx={{ display: "flex", gap: 1.2, alignItems: "center", mb: 1.2 }}>
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      flexShrink: 0,
                      borderRadius: "50%",
                      backgroundColor: colors.leafPale,
                      color: colors.moss,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={13} strokeWidth={3} />
                  </Box>
                  <Typography sx={{ fontSize: "0.9rem", color: colors.inkSoft }}>
                    {point}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        <Typography
          sx={{
            mt: 4,
            fontSize: "0.8rem",
            lineHeight: 1.7,
            color: colors.inkSoft,
            textAlign: "center",
            maxWidth: 760,
            mx: "auto",
          }}
        >
          Jeeva products support general wellness as part of a balanced diet. They are not
          intended to diagnose, treat, cure or prevent any disease. Please consult a doctor
          for specific health conditions.
        </Typography>
      </Container>
    </Box>
  );
}

export default BenefitsSection;