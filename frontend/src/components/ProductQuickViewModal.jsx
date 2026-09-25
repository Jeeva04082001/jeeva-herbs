import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Chip,
  Divider,
  Rating,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import api from "../services/api";

const API_BASE_URL = "http://localhost:8002";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}

function ProductQuickViewModal({
  open,
  product,
  selectedVariant,
  setSelectedVariant,
  quantity,
  setQuantity,
  onClose,
  onAddToCart,
}) {

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!open || !product?.id) return;

    async function fetchReviews() {
      try {
        setReviewsLoading(true);

        const response = await api.get(
          `/api/products/${product.id}/reviews`
        );

        setReviews(response.data.reviews || []);
        setAverageRating(response.data.average_rating || 0);
        setTotalReviews(response.data.total_reviews || 0);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);

        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
      } finally {
        setReviewsLoading(false);
      }
    }

    fetchReviews();
  }, [open, product?.id]);



  if (!product) return null;

  const activeVariants =
    product.variants?.filter(
      (variant) => variant.is_active
    ) || [];

  const currentVariant =
    selectedVariant ||
    activeVariants[0] ||
    null;

  const currentPrice =
    currentVariant?.price ??
    product.price ??
    0;

  const currentUnit =
    currentVariant?.unit ??
    product.unit ??
    "";

  const currentStock =
    Number(
      currentVariant?.stock ??
      product.stock ??
      0
    );

  const subtotal =
    Number(currentPrice) * quantity;

  function decreaseQuantity() {
    setQuantity((prev) =>
      Math.max(1, prev - 1)
    );
  }

  function increaseQuantity() {
    setQuantity((prev) =>
      Math.min(currentStock, prev + 1)
    );
  }


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: "18px",
          overflow: "hidden",
          backgroundColor: "#fff",
          maxWidth: "1000px",
          margin: {
            xs: 1,
            sm: 3,
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          position: "relative",
        }}
      >
        {/* CLOSE */}

        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 10,
            width: 42,
            height: 42,
            backgroundColor: "#fff",
            color: "#14342a",
            boxShadow:
              "0 4px 18px rgba(0,0,0,0.15)",
            "&:hover": {
              backgroundColor: "#14342a",
              color: "#fff",
            },
          }}
        >
          <X size={22} />
        </IconButton>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            alignItems: "start",
          }}
        >
          {/* ================================================= */}
          {/* LEFT - PRODUCT IMAGE */}
          {/* ================================================= */}

          <Box
            sx={{
              backgroundColor: "#f3efe5",
              height: {
                xs: 320,
                sm: 420,
                md: 560,
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {product.image_url ? (
              <Box
                component="img"
                src={getImageUrl(
                  product.image_url
                )}
                alt={product.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Typography
                sx={{
                  color: "#5c554a",
                }}
              >
                No image available
              </Typography>
            )}
          </Box>

          {/* ================================================= */}
          {/* RIGHT - PRODUCT DETAILS */}
          {/* ================================================= */}

          <Box
            sx={{
              p: {
                xs: 3,
                sm: 4,
                md: 5,
              },
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              overflowY: {
                xs: "visible",
                md: "auto",
              },
              maxHeight: {
                md: 560,
              },
            }}
          >
            {/* TAG */}

            {product.tag && (
              <Chip
                label={product.tag}
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  backgroundColor:
                    "#e4ead9",
                  color: "#3f6b4a",
                  fontWeight: 600,
                  mb: 2,
                }}
              />
            )}

            {/* PRODUCT NAME */}

            <Typography
              sx={{
                fontSize: {
                  xs: "1.7rem",
                  sm: "2rem",
                },
                fontWeight: 700,
                color: "#14342a",
                lineHeight: 1.2,
                mb: 2.5,
              }}
            >
              {product.name}
            </Typography>

            {/* ================================================= */}
            {/* PRODUCT RATING */}
            {/* ================================================= */}

            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2.5 }}
            >
              {totalReviews > 0 ? (
                <>
                  <Rating
                    value={averageRating}
                    precision={0.1}
                    readOnly
                    size="small"
                  />

                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#14342a",
                      fontSize: "0.9rem",
                    }}
                  >
                    {averageRating.toFixed(1)}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#5c554a",
                      fontSize: "0.85rem",
                    }}
                  >
                    ({totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"})
                  </Typography>
                </>
              ) : (
                <Typography
                  sx={{
                    color: "#777",
                    fontSize: "0.85rem",
                  }}
                >
                  No reviews yet
                </Typography>
              )}
            </Stack>

            {/* DESCRIPTION */}



            {product.description && (
              <Box sx={{ mb: 3 }}>
                {product.description
                  .split(/(?=PREPARATION:|BENEFITS OF)/i)
                  .map((section, index) => {
                    const text = section.trim();

                    if (!text) return null;

                    const isPreparation =
                      text.toUpperCase().startsWith("PREPARATION:");

                    const isBenefits =
                      text.toUpperCase().startsWith("BENEFITS OF");

                    let heading = "";
                    let content = text;

                    if (isPreparation) {
                      heading = "Preparation";
                      content = text.replace(/^PREPARATION:\s*-*\s*/i, "");
                    } else if (isBenefits) {
                      heading = text.match(/^BENEFITS OF [^0-9]*/i)?.[0]?.trim() || "Benefits";
                      content = text.replace(/^BENEFITS OF[^0-9]*/i, "");
                    }

                    const points = content
                      .split(/\s*(?=\d+\)\.?)/)
                      .map((point) => point.trim())
                      .filter(Boolean);

                    return (
                      <Box key={index} sx={{ mb: 2.5 }}>
                        {heading && (
                          <Typography
                            sx={{
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              color: "#14342a",
                              mb: 1.2,
                            }}
                          >
                            {heading}
                          </Typography>
                        )}

                        <Box>
                          {points.map((point, pointIndex) => (
                            <Box
                              key={pointIndex}
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 1,
                                mb: 0.8,
                              }}
                            >
                              <Typography
                                sx={{
                                  color: "#3f6b4a",
                                  fontWeight: 700,
                                  minWidth: "22px",
                                }}
                              >
                                {pointIndex + 1}.
                              </Typography>

                              <Typography
                                sx={{
                                  color: "#5c554a",
                                  fontSize: "0.95rem",
                                  lineHeight: 1.7,
                                }}
                              >
                                {point.replace(/^\d+\)\.?\s*/, "")}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
              </Box>
            )}


            {/* INGREDIENTS */}


            {Array.isArray(product.ingredients) &&
              product.ingredients.length > 0 && (
                <Box
                  sx={{
                    mb: 3,
                    width: "100%",
                    minWidth: 0,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#14342a",
                      fontSize: "1.1rem",
                      mb: 1.2,
                    }}
                  >
                    Ingredients
                  </Typography>

                  <Typography
                    component="div"
                    sx={{
                      color: "#3f6b4a",
                      fontSize: "0.95rem",
                      lineHeight: 1.8,
                      width: "100%",
                      whiteSpace: "normal",
                      overflowWrap: "break-word",
                    }}
                  >
                    {product.ingredients.join(", ")}
                  </Typography>
                </Box>
              )}



            <Divider sx={{ mb: 3 }} />

            {/* ================================================= */}
            {/* PACK SIZE */}
            {/* ================================================= */}

            {activeVariants.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#14342a",
                    mb: 1.5,
                  }}
                >
                  Pack Size
                </Typography>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  gap={1}
                >
                  {activeVariants.map(
                    (variant) => {
                      const selected =
                        currentVariant?.id ===
                        variant.id;

                      return (
                        <Button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(
                              variant
                            );
                            setQuantity(1);
                          }}
                          sx={{
                            minWidth: 90,
                            border:
                              "1px solid #14342a",
                            borderRadius:
                              "4px",
                            px: 2,
                            py: 1.1,
                            fontWeight: 600,
                            color: selected
                              ? "#fff"
                              : "#14342a",
                            backgroundColor:
                              selected
                                ? "#14342a"
                                : "#fff",
                            "&:hover": {
                              backgroundColor:
                                selected
                                  ? "#0e261e"
                                  : "#e4ead9",
                            },
                          }}
                        >
                          {variant.unit}
                        </Button>
                      );
                    }
                  )}
                </Stack>
              </Box>
            )}

            {/* ================================================= */}
            {/* PRICE */}
            {/* ================================================= */}

            <Typography
              sx={{
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#14342a",
                mb: 0.5,
              }}
            >
              ₹{Number(currentPrice).toFixed(2)}
            </Typography>

            <Typography
              sx={{
                color: "#5c554a",
                fontSize: "0.95rem",
                mb: 3,
              }}
            >
              / {currentUnit}
            </Typography>

            {/* ================================================= */}
            {/* STOCK */}
            {/* ================================================= */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    currentStock > 0 ? "#3f6b4a" : "#b23b3b",
                  flexShrink: 0,
                }}
              />

              <Typography
                sx={{
                  color:
                    currentStock > 0 ? "#3f6b4a" : "#b23b3b",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  lineHeight: 1.2,
                }}
              >
                {currentStock > 0
                  ? `${currentStock} available`
                  : "Out of stock"}
              </Typography>
            </Box>

            {/* ================================================= */}
            {/* QUANTITY */}
            {/* ================================================= */}

            {currentStock > 0 && (
              <>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "#14342a",
                    mb: 1,
                  }}
                >
                  Quantity
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "160px",
                    border:
                      "1px solid rgba(20,52,42,0.2)",
                    borderRadius: "8px",
                    mb: 3,
                  }}
                >
                  <IconButton
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    sx={{
                      color:
                        "#14342a",
                    }}
                  >
                    <Minus size={18} />
                  </IconButton>

                  <Typography
                    sx={{
                      flex: 1,
                      textAlign:
                        "center",
                      fontWeight: 600,
                    }}
                  >
                    {quantity}
                  </Typography>

                  <IconButton
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                      currentStock
                    }
                    sx={{
                      color:
                        "#14342a",
                    }}
                  >
                    <Plus size={18} />
                  </IconButton>
                </Box>

                {/* SUBTOTAL */}

                <Typography
                  sx={{
                    color: "#5c554a",
                    mb: 2.5,
                  }}
                >
                  Subtotal:{" "}
                  <Box
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color:
                        "#14342a",
                    }}
                  >
                    ₹
                    {subtotal.toFixed(
                      2
                    )}
                  </Box>
                </Typography>
              </>
            )}

            {/* ================================================= */}
            {/* ADD TO CART */}
            {/* ================================================= */}

            <Button
              fullWidth
              variant="contained"
              disabled={
                currentStock <= 0
              }
              onClick={onAddToCart}
              startIcon={
                <ShoppingBag
                  size={19}
                />
              }
              sx={{
                mt: "auto",
                py: 1.6,
                backgroundColor:
                  "#14342a",
                color: "#fff",
                borderRadius:
                  "6px",
                fontWeight: 700,
                fontSize:
                  "1rem",
                "&:hover": {
                  backgroundColor:
                    "#0e261e",
                },
                "&:disabled": {
                  backgroundColor:
                    "#aaa",
                },
              }}
            >
              {currentStock > 0
                ? "ADD TO CART"
                : "OUT OF STOCK"}
            </Button>


            {/* ================================================= */}
            {/* CUSTOMER REVIEWS */}
            {/* ================================================= */}

            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#14342a",
                  fontSize: "1.1rem",
                  mb: 1.5,
                }}
              >
                Customer Reviews
              </Typography>

              {reviewsLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 2,
                  }}
                >
                  <CircularProgress
                    size={24}
                    sx={{ color: "#14342a" }}
                  />
                </Box>
              ) : reviews.length === 0 ? (
                <Typography
                  sx={{
                    color: "#777",
                    fontSize: "0.9rem",
                  }}
                >
                  No customer reviews yet.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {reviews.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        p: 2,
                        borderRadius: "10px",
                        backgroundColor: "#f7f1e3",
                        border: "1px solid rgba(20,52,42,0.08)",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 0.8 }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#14342a",
                            fontSize: "0.9rem",
                          }}
                        >
                          {item.user_name}
                        </Typography>

                        <Rating
                          value={item.rating}
                          readOnly
                          size="small"
                        />
                      </Stack>

                      {item.review && (
                        <Typography
                          sx={{
                            color: "#5c554a",
                            fontSize: "0.9rem",
                            lineHeight: 1.6,
                          }}
                        >
                          {item.review}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>


          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ProductQuickViewModal;