import { Box, Typography } from "@mui/material";
import { colors, fonts } from "../theme/brand";

/**
 * Shared heading block: small eyebrow + display title + optional subtitle.
 * tone="light" when the section sits on the dark forest background.
 */
function SectionHeader({ eyebrow, title, subtitle, align = "center", tone = "dark" }) {
  const isLight = tone === "light";

  return (
    <Box
      sx={{
        textAlign: align,
        maxWidth: 720,
        mx: align === "center" ? "auto" : 0,
        mb: { xs: 4, md: 6 },
      }}
    >
      {eyebrow && (
        <Typography
          component="p"
          sx={{
            fontSize: "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: isLight ? colors.gold : colors.moss,
            mb: 1.5,
          }}
        >
          {eyebrow}
        </Typography>
      )}

      <Typography
        variant="h3"
        sx={{
          fontFamily: fonts.display,
          fontWeight: 600,
          lineHeight: 1.2,
          color: isLight ? colors.cream : colors.forest,
          fontSize: { xs: "1.75rem", md: "2.4rem" },
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          sx={{
            mt: 2,
            fontSize: "1rem",
            lineHeight: 1.7,
            color: isLight ? "rgba(247,241,227,0.78)" : colors.inkSoft,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export default SectionHeader;