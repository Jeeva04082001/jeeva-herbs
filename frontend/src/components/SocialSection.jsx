import { Box, Container, Typography, Button } from "@mui/material";
import { InstagramIcon } from "./SocialIcons";
import { colors, fonts, sectionPad, INSTAGRAM_HANDLE } from "../theme/brand";

function SocialSection({ posts = [] }) {
  const tiles = posts.length ? posts : Array.from({ length: 6 });

  return (
    <Box component="section" sx={{ backgroundColor: colors.creamDeep, ...sectionPad }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: fonts.display,
              fontWeight: 600,
              color: colors.forest,
              fontSize: { xs: "1.5rem", md: "1.9rem" },
            }}
          >
            Follow along
          </Typography>

          <Button
            component="a"
            href={`https://instagram.com/${INSTAGRAM_HANDLE.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<InstagramIcon size={18} />}
            sx={{ color: colors.clay, fontWeight: 600 }}
          >
            {INSTAGRAM_HANDLE}
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
            gap: { xs: 1, md: 1.5 },
          }}
        >
          {tiles.map((post, index) => (
            <Box
              key={post?.src || index}
              sx={{
                aspectRatio: "1 / 1",
                borderRadius: "14px",
                overflow: "hidden",
                backgroundColor: colors.leafPale,
                border: `1px solid ${colors.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.moss,
              }}
            >
              {post?.src ? (
                <Box
                  component="img"
                  src={post.src}
                  alt={post.alt || ""}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <InstagramIcon size={18} strokeWidth={1.5} />
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default SocialSection;