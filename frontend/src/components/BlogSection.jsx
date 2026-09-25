import { Box, Container, Typography, Button } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import { colors, fonts, cardSx, sectionPad } from "../theme/brand";

const posts = [
  {
    slug: "murungai-keerai-benefits",
    tag: "Nutrition",
    title: "Benefits of murungai keerai in an everyday diet",
  },
  {
    slug: "modakathan-joint-health",
    tag: "Wellness",
    title: "How modakathan supports joint health",
  },
  {
    slug: "immunity-foods-every-season",
    tag: "Immunity",
    title: "Immunity foods for every season",
  },
  {
    slug: "herbal-soup-rainy-season",
    tag: "Seasonal",
    title: "Why herbal soup belongs in the rainy season",
  },
];

function BlogSection() {
  return (
    <Box component="section" id="journal" sx={{ backgroundColor: colors.creamDeep, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="From the Journal" title="Learn about the herbs you eat" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {posts.map((post) => (
            <Box key={post.slug} sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: colors.leaf,
                  mb: 1,
                }}
              >
                {post.tag}
              </Typography>

              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  color: colors.forest,
                  lineHeight: 1.4,
                  mb: 2,
                }}
              >
                {post.title}
              </Typography>

              {/* Point this at your blog route once it exists */}
              <Button
                component={Link}
                to={`/blog/${post.slug}`}
                endIcon={<ArrowRight size={15} />}
                sx={{
                  mt: "auto",
                  alignSelf: "flex-start",
                  color: colors.clay,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  px: 0,
                }}
              >
                Read more
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default BlogSection;