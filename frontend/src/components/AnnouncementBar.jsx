import { Box, Typography } from "@mui/material";
import { colors } from "../theme/brand";

const notices = [
  "Free delivery above ₹499",
  "Dispatch within 24 hours",
  "100% natural · no preservatives",
];

/** Thin scrolling strip that sits above the Navbar. */
function AnnouncementBar() {
  const track = [...notices, ...notices]; // duplicated so the loop is seamless

  return (
    <Box
      sx={{
        backgroundColor: colors.gold,
        color: colors.forest,
        overflow: "hidden",
        py: 0.9,
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "max-content",
          gap: 6,
          pl: 6,
          animation: "jeevaMarquee 26s linear infinite",
          "@keyframes jeevaMarquee": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(-50%)" },
          },
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        }}
      >
        {track.map((notice, i) => (
          <Typography
            key={`${notice}-${i}`}
            sx={{ fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}
          >
            {notice}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default AnnouncementBar;