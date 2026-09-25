import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import {
  Box,
  Container,
  Grid,
  Typography,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import { ShoppingBag } from "lucide-react";

function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    fetchProduct();
  }, [slug]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const response = await api.get("/api/products");
      const products = response.data.products || response.data;
      const foundProduct = products.find((item) => item.slug === slug);

      if (!foundProduct) {
        toast.error("Product not found");
        return;
      }

      setProduct(foundProduct);
    } catch (error) {
      console.error("Failed to load product:", error);
      toast.error("Unable to load product");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f7f1e3" }}>
        <CircularProgress sx={{ color: "#14342a" }} />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f7f1e3" }}>
        <Typography sx={{ color: "#5c554a" }}>Product not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f7f1e3", py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            {product.image_url ? (
              <Box
                component="img"
                src={product.image_url}
                alt={product.name}
                sx={{
                  width: "100%",
                  aspectRatio: "1/1",
                  objectFit: "cover",
                  borderRadius: "22px",
                  border: "1px solid rgba(20,52,42,0.1)",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1/1",
                  borderRadius: "22px",
                  background: "linear-gradient(155deg,#dfead2,#c7dcb4)",
                }}
              />
            )}
          </Grid>

          <Grid item xs={12} md={7}>
            {product.tag && (
              <Chip
                label={product.tag}
                size="small"
                sx={{ mb: 1.5, backgroundColor: "#e4ead9", color: "#3f6b4a", fontWeight: 600 }}
              />
            )}

            <Typography sx={{ fontWeight: 600, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: "#14342a", mb: 1.5 }}>
              {product.name}
            </Typography>

            <Typography sx={{ color: "#5c554a", fontSize: "1rem", lineHeight: 1.7, mb: 2.5 }}>
              {product.description}
            </Typography>

            <Typography sx={{ fontWeight: 700, fontSize: "1.6rem", color: "#14342a", mb: 1 }}>
              ₹{product.price} <Box component="span" sx={{ fontWeight: 400, fontSize: "0.9rem", color: "#5c554a" }}>/ {product.unit}</Box>
            </Typography>

            <Typography sx={{ color: "#5c554a", fontSize: "0.9rem", mb: 2 }}>
              Category: {product.category}
            </Typography>

            <Typography sx={{ fontWeight: 600, color: "#14342a", mb: 1 }}>Ingredients</Typography>

            {product.ingredients?.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2.5 }}>
                {product.ingredients.map((ingredient, index) => (
                  <Chip
                    key={index}
                    label={ingredient}
                    size="small"
                    sx={{ backgroundColor: "#e4ead9", color: "#14342a", fontWeight: 500 }}
                  />
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: "#5c554a", fontSize: "0.9rem", mb: 2.5 }}>
                No ingredients listed.
              </Typography>
            )}

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9rem",
                color: product.in_stock ? "#3f6b4a" : "#b23b3b",
                mb: 3,
              }}
            >
              {product.in_stock ? `In Stock (${product.stock})` : "Out of Stock"}
            </Typography>

            <Button
              disabled={!product.in_stock}
              onClick={() => addToCart(product)}
              variant="contained"
              startIcon={<ShoppingBag size={18} />}
              sx={{
                backgroundColor: "#14342a",
                color: "#f7f1e3",
                px: 4,
                py: 1.4,
                borderRadius: "100px",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#0e261e" },
                "&.Mui-disabled": { backgroundColor: "#d8d2c2", color: "#9a9385" },
              }}
            >
              Add to Cart
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default ProductDetails;