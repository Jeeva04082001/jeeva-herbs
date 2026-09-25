import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { MessageCircle } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { colors, fonts, cardSx, sectionPad, waLink } from "../theme/brand";

const combos = [
  {
    badge: "Popular",
    name: "Starter Combo",
    items: "Murungai Soup · Modakathan Soup · Thoothuvalai Soup",
    price: 399,
    mrp: 449,
    highlight: false,
  },
  {
    badge: "Best Value",
    name: "Family Combo",
    items: "2× Murungai · 2× Modakathan · 2× Idly Podi",
    price: 749,
    mrp: 845,
    highlight: true,
  },
  {
    badge: "All 4",
    name: "Complete Wellness",
    items: "All 4 variants — one of each",
    price: 549,
    mrp: 596,
    highlight: false,
  },
];

function ComboSection() {
  return (
    <Box component="section" id="combos" sx={{ backgroundColor: colors.cream, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="Combo Packs" title="Try the range, save more" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {combos.map((combo) => (
            <Box
              key={combo.name}
              sx={{
                ...cardSx,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                backgroundColor: combo.highlight ? colors.forest : "#fff",
                borderColor: combo.highlight ? colors.forest : colors.line,
              }}
            >
              <Chip
                label={combo.badge}
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  backgroundColor: combo.highlight ? colors.gold : colors.leafPale,
                  color: combo.highlight ? colors.forest : colors.moss,
                  fontWeight: 600,
                }}
              />

              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  color: combo.highlight ? colors.cream : colors.forest,
                }}
              >
                {combo.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  color: combo.highlight ? "rgba(247,241,227,0.8)" : colors.inkSoft,
                }}
              >
                {combo.items}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.2, mt: 1 }}>
                <Typography
                  sx={{
                    fontFamily: fonts.display,
                    fontSize: "1.8rem",
                    fontWeight: 700,
                    color: combo.highlight ? colors.cream : colors.forest,
                  }}
                >
                  ₹{combo.price}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    textDecoration: "line-through",
                    color: combo.highlight ? "rgba(247,241,227,0.6)" : colors.inkSoft,
                  }}
                >
                  ₹{combo.mrp}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.8rem", fontWeight: 700, color: colors.gold }}
                >
                  Save ₹{combo.mrp - combo.price}
                </Typography>
              </Box>

              <Button
                component="a"
                href={waLink(`Hi Jeeva Herbs, I would like to order the ${combo.name} (₹${combo.price}).`)}
                target="_blank"
                rel="noopener noreferrer"
                variant={combo.highlight ? "contained" : "outlined"}
                startIcon={<MessageCircle size={17} />}
                sx={{
                  mt: "auto",
                  borderRadius: "100px",
                  py: 1.1,
                  fontWeight: 600,
                  ...(combo.highlight
                    ? {
                        backgroundColor: colors.gold,
                        color: colors.forest,
                        "&:hover": { backgroundColor: "#b3862f" },
                      }
                    : {
                        borderColor: colors.forest,
                        color: colors.forest,
                        "&:hover": {
                          borderColor: colors.forest,
                          backgroundColor: "rgba(20,52,42,0.06)",
                        },
                      }),
                }}
              >
                Order on WhatsApp
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default ComboSection;