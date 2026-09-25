import { Box, Container, Typography, Avatar } from "@mui/material";
import { colors, fonts, sectionPad } from "../theme/brand";

function FounderSection() {
  return (
    <Box component="section" sx={{ backgroundColor: colors.cream, ...sectionPad }}>
      <Container maxWidth="md">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" },
            gap: { xs: 3, md: 5 },
            alignItems: "center",
            backgroundColor: "#fff",
            border: `1px solid ${colors.line}`,
            borderRadius: "28px",
            p: { xs: 3, md: 5 },
          }}
        >
          {/* Swap Avatar children for src={founderPhoto} when you have the photo */}
          <Avatar
            sx={{
              width: { xs: 76, md: 104 },
              height: { xs: 76, md: 104 },
              backgroundColor: colors.leafPale,
              color: colors.forest,
              fontFamily: fonts.display,
              fontSize: { xs: "2rem", md: "2.6rem" },
              fontWeight: 700,
            }}
          >
            J
          </Avatar>

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
              Founder's Note
            </Typography>

            <Typography
              sx={{
                fontFamily: fonts.display,
                fontStyle: "italic",
                fontSize: { xs: "1.05rem", md: "1.25rem" },
                lineHeight: 1.7,
                color: colors.ink,
                mb: 2.5,
              }}
            >
              "Hi, I'm Jeeva. I started Jeeva Herbal Soup Premix to make traditional herbal
              foods easily available for today's busy families. Every product is prepared
              with carefully selected ingredients and traditional methods — the way it was
              always meant to be made."
            </Typography>

            <Typography sx={{ fontWeight: 700, color: colors.forest }}>Jeeva</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: colors.inkSoft }}>
              Founder, Jeeva Herbal Soup Premix
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default FounderSection;