import { Box, Container, Typography } from "@mui/material";
import { Quote } from "lucide-react";
import { colors, fonts, sectionPad } from "../theme/brand";

const stats = [
  { value: "4", label: "Herbal Variants" },
  { value: "0%", label: "Artificial Additives" },
  { value: "5 min", label: "To Prepare" },
];

function AboutSection() {
  return (
    <Box component="section" id="about" sx={{ backgroundColor: colors.creamDeep, ...sectionPad }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
            gap: { xs: 4, md: 8 },
            alignItems: "center",
          }}
        >
          {/* PULL QUOTE */}
          <Box
            sx={{
              backgroundColor: colors.forest,
              borderRadius: "28px",
              p: { xs: 3.5, md: 5 },
              color: colors.cream,
            }}
          >
            <Quote size={30} color={colors.gold} />
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontStyle: "italic",
                fontSize: { xs: "1.3rem", md: "1.6rem" },
                lineHeight: 1.5,
                mt: 2,
              }}
            >
              Every packet carries a recipe passed down, not manufactured.
            </Typography>
          </Box>

          {/* STORY */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: colors.moss,
                mb: 1.5,
              }}
            >
              Our Story
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                color: colors.forest,
                fontSize: { xs: "1.7rem", md: "2.2rem" },
                lineHeight: 1.25,
                mb: 2.5,
              }}
            >
              Rooted in tradition, made for today's kitchen.
            </Typography>

            <Typography sx={{ color: colors.inkSoft, lineHeight: 1.8, mb: 2 }}>
              Jeeva Herbal Soup Premix is dedicated to bringing traditional herbal nutrition
              into every home. We start with murungai, modakathan and thoothuvalai — leaves
              our grandmothers trusted — and prepare them the slow way, with nothing
              artificial added.
            </Typography>

            <Typography sx={{ color: colors.inkSoft, lineHeight: 1.8, mb: 4 }}>
              No preservatives. No shortcuts. Just real ingredients, sun-dried and
              stone-ground, packed to reach your kitchen the way nature intended.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 2,
                borderTop: `1px solid ${colors.line}`,
                pt: 3,
              }}
            >
              {stats.map(({ value, label }) => (
                <Box key={label}>
                  <Typography
                    sx={{
                      fontFamily: fonts.display,
                      fontSize: { xs: "1.5rem", md: "1.9rem" },
                      fontWeight: 700,
                      color: colors.clay,
                    }}
                  >
                    {value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: colors.inkSoft }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default AboutSection;