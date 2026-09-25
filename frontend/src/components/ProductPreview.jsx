import { Box, Container, Typography, Button, Chip } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import { colors, fonts, cardSx, sectionPad } from "../theme/brand";

/**
 * Static preview of the range. When your API is ready, pass real products in:
 *   <ProductPreview products={productsFromApi} />
 */
const defaultProducts = [
  {
    id: "murungai-soup",
    tag: "Immunity",
    name: "Murungai Keerai Soup",
    description: "Drumstick leaf soup, rich in iron and calcium — a daily wellness staple.",
    ingredients: ["Murungai Keerai", "Curry Leaves", "Garlic", "Pepper", "Cumin", "Turmeric"],
    price: 149,
    weight: "200g",
  },
  {
    id: "modakathan-soup",
    tag: "Joint Care",
    name: "Modakathan Soup",
    description: "Traditional joint-health herb, supports digestion and easy movement.",
    ingredients: ["Modakathan", "Roasted Gram", "Green Gram", "Pepper", "Cumin"],
    price: 159,
    weight: "200g",
  },
  {
    id: "thoothuvalai-soup",
    tag: "Cold & Cough",
    name: "Thoothuvalai Soup",
    description: "A time-tested remedy for cold season, soothing and immunity supporting.",
    ingredients: ["Thoothuvalai", "Garlic", "Pepper", "Cumin", "Turmeric"],
    price: 159,
    weight: "200g",
  },
  {
    id: "idly-podi",
    tag: "Everyday",
    name: "Idly Podi",
    description: "Murungai & karuveppilai spice blend — perfect with idli, dosa and rice.",
    ingredients: ["Murungai", "Karuveppilai", "Roasted Gram", "Sesame"],
    price: 129,
    weight: "200g",
  },
];

function ProductPreview({ products = defaultProducts, onAddToCart }) {
  return (
    <Box component="section" id="products" sx={{ backgroundColor: colors.creamDeep, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="Our Variants" title="Soup premix, rooted in tradition" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {products.map((product) => (
            <Box
              key={product.id}
              sx={{ ...cardSx, display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              <Chip
                label={product.tag}
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  backgroundColor: colors.leafPale,
                  color: colors.moss,
                  fontWeight: 600,
                }}
              />

              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: colors.forest,
                }}
              >
                {product.name}
              </Typography>

              <Typography sx={{ fontSize: "0.88rem", color: colors.inkSoft, lineHeight: 1.6 }}>
                {product.description}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: 1 }}>
                {product.ingredients.map((item) => (
                  <Typography
                    key={item}
                    sx={{
                      fontSize: "0.72rem",
                      color: colors.inkSoft,
                      border: `1px solid ${colors.line}`,
                      borderRadius: "100px",
                      px: 1.1,
                      py: 0.3,
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Box>

              <Box
                sx={{
                  mt: "auto",
                  pt: 2,
                  borderTop: `1px solid ${colors.line}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                  <Typography
                    sx={{
                      fontFamily: fonts.display,
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: colors.forest,
                    }}
                  >
                    ₹{product.price}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: colors.inkSoft }}>
                    / {product.weight}
                  </Typography>
                </Box>

                {onAddToCart ? (
                  <Button
                    onClick={() => onAddToCart(product)}
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: colors.forest,
                      color: colors.cream,
                      borderRadius: "100px",
                      px: 2,
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#0e261e" },
                    }}
                  >
                    Add
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    to="/products"
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: colors.forest,
                      color: colors.cream,
                      borderRadius: "100px",
                      px: 2,
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#0e261e" },
                    }}
                  >
                    Buy Now
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Button
            component={Link}
            to="/products"
            endIcon={<ArrowRight size={18} />}
            sx={{ color: colors.forest, fontWeight: 600 }}
          >
            See all products
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default ProductPreview;