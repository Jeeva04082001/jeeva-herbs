import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import CartDrawer from "../components/CartDrawer";
import QuickAddModal from "../components/QuickAddModal";
import ProductQuickViewModal from "../components/ProductQuickViewModal";

const API_BASE_URL = "http://localhost:8002";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

function Products() {
  const [quickAddProduct, setQuickAddProduct] = useState(null);
  const [quickAddQuantity, setQuickAddQuantity] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewVariant, setQuickViewVariant] = useState(null);
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isAdmin = isAuthenticated && user?.is_staff;

  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await api.get("/api/products");
      setProducts(response.data.products || response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Unable to load products");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickAdd() {
    if (!quickAddProduct) return;

    addToCart(
      quickAddProduct,
      quickAddQuantity,
      selectedVariant
    );

    setQuickAddProduct(null);
    setSelectedVariant(null);
    setQuickAddQuantity(1);

    setCartOpen(true);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDeactivate(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this product?"
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/products/${productId}`);
      toast.success("Product deactivated successfully");
      fetchProducts();
    } catch (error) {
      console.error("Deactivate failed:", error);
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f1e3",
        }}
      >
        <CircularProgress sx={{ color: "#14342a" }} />
      </Box>
    );
  }

  function handleQuickViewAddToCart() {
    if (!quickViewProduct) return;

    addToCart(
      quickViewProduct,
      quickViewQuantity,
      quickViewVariant
    );

    toast.success(
      `${quickViewProduct.name} added to cart`
    );

    setQuickViewProduct(null);
    setQuickViewVariant(null);
    setQuickViewQuantity(1);
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f7f1e3", py: { xs: 5, md: 8 } }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 5 }}
        >
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: "#14342a" }}>
              Our Products
            </Typography>
            <Typography sx={{ color: "#5c554a", mt: 0.5 }}>
              Jeeva Herbal Soup Premix — natural products
            </Typography>
          </Box>

          {isAdmin && (
            <Button
              startIcon={<Plus size={18} />}
              onClick={() => navigate("/products/add")}
              variant="contained"
              sx={{
                backgroundColor: "#14342a",
                borderRadius: "100px",
                px: 3,
                fontWeight: 600,
                "&:hover": { backgroundColor: "#0e261e" },
              }}
            >
              Add Product
            </Button>
          )}
        </Stack>

        {products.length === 0 ? (
          <Typography sx={{ color: "#5c554a" }}>No products available.</Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  elevation={0}
                  onClick={() => {
                    const activeVariants =
                      product.variants?.filter(
                        (variant) => variant.is_active
                      ) || [];

                    setQuickViewProduct(product);

                    setQuickViewVariant(
                      activeVariants.length > 0
                        ? activeVariants[0]
                        : null
                    );

                    setQuickViewQuantity(1);
                  }}
                  sx={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid rgba(20,52,42,0.08)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#fff",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",

                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 18px 35px rgba(20,52,42,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1 / 1",
                      overflow: "hidden",
                      backgroundColor: "#f3efe5",

                      "&:hover .product-main-image": {
                        opacity: product.hover_image_url ? 0 : 1,
                      },

                      "&:hover .product-hover-image": {
                        opacity: product.hover_image_url ? 1 : 0,
                      },

                      "&:hover .quick-view-button": {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    {/* Main Image */}
                    {product.image_url && (
                      <Box
                        component="img"
                        className="product-main-image"
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          opacity: 1,
                          transition: "opacity 0.35s ease",
                        }}
                      />
                    )}

                    {/* Hover Image */}
                    {product.hover_image_url && (
                      <Box
                        component="img"
                        className="product-hover-image"
                        src={getImageUrl(product.hover_image_url)}
                        alt={`${product.name} hover`}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          opacity: 0,
                          transition: "opacity 0.35s ease",
                        }}
                      />
                    )}

                    {/* Quick View */}
                    <Button
                      // component={Link}
                      // to={`/products/${product.slug}`}
                      className="quick-view-button"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        minWidth: 42,
                        width: 42,
                        height: 42,
                        padding: 0,
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        color: "#14342a",
                        opacity: 0,
                        transform: "translateY(-8px)",
                        transition: "all 0.25s ease",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.12)",

                        "&:hover": {
                          backgroundColor: "#14342a",
                          color: "#fff",
                        },
                      }}

                      onClick={(event) => {
                        event.stopPropagation();
                        const activeVariants =
                          product.variants?.filter(
                            (variant) => variant.is_active
                          ) || [];

                        setQuickViewProduct(product);

                        setQuickViewVariant(
                          activeVariants.length > 0
                            ? activeVariants[0]
                            : null
                        );

                        setQuickViewQuantity(1);
                      }}
                    >
                      <Eye size={20} />
                    </Button>
                  </Box>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      px: 2,
                      py: 2.2,
                    }}
                  >
                    {product.tag && (
                      <Chip
                        label={product.tag}
                        size="small"
                        sx={{
                          alignSelf: "flex-start",
                          mb: 1,
                          backgroundColor: "#e4ead9",
                          color: "#3f6b4a",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    )}

                    <Typography sx={{ fontWeight: 600, fontSize: "1.1rem", color: "#14342a", mb: 0.5 }}>
                      {product.name}
                    </Typography>




                    {isAdmin && (
                      <>
                        <Typography sx={{ fontSize: "0.75rem", color: "#5c554a", mb: 0.5 }}>
                          Stock: {product.stock}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: product.is_active ? "#3f6b4a" : "#b23b3b",
                            fontWeight: 600,
                            mb: 1.5,
                          }}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Typography>
                      </>
                    )}

                    {(() => {
                      const totalStock =
                        product.variants
                          ?.filter((variant) => variant.is_active)
                          .reduce(
                            (total, variant) => total + Number(variant.stock || 0),
                            0
                          ) || 0;

                      return (
                        <Typography
                          sx={{
                            mt: 1.5,
                            mb: 1.5,
                            color: totalStock > 0 ? "#3f6b4a" : "#b42318",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            textAlign: "center",
                          }}
                        >
                          {totalStock > 0
                            ? `${totalStock} packs available`
                            : "Out of stock"}
                        </Typography>
                      );
                    })()}

                    <Button
                      fullWidth
                      onClick={(event) => {
                        event.stopPropagation();

                        setQuickAddProduct(product);

                        setSelectedVariant(
                          product.variants?.find((v) => v.is_active) || null
                        );

                        setQuickAddQuantity(1);
                      }}
                      sx={{
                        mt: 1.5,
                        border: "1px solid #14342a",
                        borderRadius: "0px",
                        color: "#14342a",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        py: 1.2,

                        "&:hover": {
                          backgroundColor: "#14342a",
                          color: "#fff",
                        },
                      }}
                    >
                      QUICK ADD
                    </Button>

                    {isAdmin && (
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button
                          size="small"
                          startIcon={<Pencil size={14} />}
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/products/edit/${product.id}`);
                          }}
                          // onClick={() => navigate(`/products/edit/${product.id}`)}
                          sx={{
                            backgroundColor: "#e4ead9",
                            color: "#14342a",
                            borderRadius: "100px",
                            fontSize: "0.75rem",
                            "&:hover": { backgroundColor: "#14342a", color: "#f7f1e3" },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Trash2 size={14} />}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeactivate(product.id);
                          }}
                          // onClick={() => handleDeactivate(product.id)}
                          sx={{
                            backgroundColor: "#f3e2df",
                            color: "#b23b3b",
                            borderRadius: "100px",
                            fontSize: "0.75rem",
                            "&:hover": { backgroundColor: "#b23b3b", color: "#fff" },
                          }}
                        >
                          Deactivate
                        </Button>
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      <QuickAddModal
        open={Boolean(quickAddProduct)}
        product={quickAddProduct}
        selectedVariant={selectedVariant}
        setSelectedVariant={setSelectedVariant}
        quantity={quickAddQuantity}
        setQuantity={setQuickAddQuantity}
        onClose={() => {
          setQuickAddProduct(null);
          setSelectedVariant(null);
          setQuickAddQuantity(1);
        }}
        onAddToCart={handleQuickAdd}
      />

      <ProductQuickViewModal
        open={Boolean(quickViewProduct)}
        product={quickViewProduct}
        selectedVariant={quickViewVariant}
        setSelectedVariant={setQuickViewVariant}
        quantity={quickViewQuantity}
        setQuantity={setQuickViewQuantity}
        onClose={() => {
          setQuickViewProduct(null);
          setQuickViewVariant(null);
          setQuickViewQuantity(1);
        }}
        onAddToCart={
          handleQuickViewAddToCart
        }
      />
    </Box>
  );

}

export default Products;