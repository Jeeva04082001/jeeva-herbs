import { Box, Container, Typography } from "@mui/material";
import { Check, X } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { colors, sectionPad, RADIUS } from "../theme/brand";

const rows = [
  { label: "Artificial flavours", others: "Often yes", jeeva: "No", jeevaGood: true },
  { label: "Preservatives", others: "Often yes", jeeva: "No", jeevaGood: true },
  { label: "Homemade method", others: "Rarely", jeeva: "Yes", jeevaGood: true },
  { label: "Herbal ingredients", others: "Rarely", jeeva: "Yes", jeevaGood: true },
];

function ComparisonSection() {
  return (
    <Box component="section" sx={{ backgroundColor: colors.cream, ...sectionPad }}>
      <Container maxWidth="md">
        <SectionHeader eyebrow="The Difference" title="Jeeva vs. the market" />

        <Box
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: RADIUS,
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          {/* Header row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              backgroundColor: colors.leafPale,
              px: { xs: 2, md: 3 },
              py: 1.8,
            }}
          >
            <Typography sx={{ fontWeight: 700, color: colors.forest, fontSize: "0.9rem" }} />
            <Typography
              sx={{ fontWeight: 700, color: colors.inkSoft, fontSize: "0.9rem", textAlign: "center" }}
            >
              Other soups
            </Typography>
            <Typography
              sx={{ fontWeight: 700, color: colors.forest, fontSize: "0.9rem", textAlign: "center" }}
            >
              Jeeva
            </Typography>
          </Box>

          {rows.map((row, index) => (
            <Box
              key={row.label}
              sx={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 1fr",
                alignItems: "center",
                px: { xs: 2, md: 3 },
                py: 1.8,
                borderTop: index === 0 ? "none" : `1px solid ${colors.line}`,
              }}
            >
              <Typography sx={{ fontWeight: 600, color: colors.forest, fontSize: "0.9rem" }}>
                {row.label}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.8 }}>
                <X size={16} color={colors.clay} />
                <Typography sx={{ fontSize: "0.85rem", color: colors.inkSoft }}>
                  {row.others}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.8 }}>
                <Check size={16} color={colors.moss} strokeWidth={3} />
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: colors.forest }}>
                  {row.jeeva}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default ComparisonSection;