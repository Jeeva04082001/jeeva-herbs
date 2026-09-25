import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";

import { X, Minus, Plus } from "lucide-react";

function QuickAddModal({
  open,
  product,
  selectedVariant,
  setSelectedVariant,
  quantity,
  setQuantity,
  onClose,
  onAddToCart,
}) {
  if (!product) return null;

  // ----------------------------------
  // FORMAT PACK SIZE
  // ----------------------------------
  function formatUnit(unit) {
    if (!unit) return "";

    const value = String(unit).trim();

    // Already contains g
    if (value.toLowerCase().endsWith("g")) {
      return value;
    }

    // Example: 50 -> 50g
    if (!isNaN(value)) {
      return `${value}g`;
    }

    return value;
  }

  // ----------------------------------
  // ACTIVE VARIANTS
  // ----------------------------------
  const activeVariants =
    product.variants?.filter(
      (variant) => variant.is_active
    ) || [];

  // ----------------------------------
  // STOCK
  // ----------------------------------
  const stock = Number(selectedVariant?.stock || 0);

  // ----------------------------------
  // QUANTITY
  // ----------------------------------
  function decreaseQuantity() {
    setQuantity((prev) => Math.max(1, prev - 1));
  }

  function increaseQuantity() {
    if (stock <= 0) return;

    setQuantity((prev) =>
      Math.min(stock, prev + 1)
    );
  }

  // ----------------------------------
  // SELECT VARIANT
  // ----------------------------------
  function handleVariantSelect(variant) {
    setSelectedVariant(variant);
    setQuantity(1);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "22px",
          overflow: "hidden",
          backgroundColor: "#fff",
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
        }}
      >

        {/* ==============================
            CLOSE BUTTON
        ============================== */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            backgroundColor: "#fff",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.12)",

            "&:hover": {
              backgroundColor: "#f7f1e3",
            },
          }}
        >
          <X size={20} />
        </IconButton>

        {/* ==============================
            PRODUCT IMAGE
        ============================== */}
        {product.image_url && (
          <Box
            component="img"
            src={
              product.image_url.startsWith("http")
                ? product.image_url
                : `http://localhost:8002${product.image_url}`
            }
            alt={product.name}
            sx={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}

        {/* ==============================
            DETAILS
        ============================== */}
        <Box
          sx={{
            p: 3,
          }}
        >

          {/* TAG */}
          {product.tag && (
            <Typography
              sx={{
                display: "inline-block",
                backgroundColor: "#e4ead9",
                color: "#3f6b4a",
                px: 1.5,
                py: 0.5,
                borderRadius: "100px",
                fontSize: "0.75rem",
                fontWeight: 600,
                mb: 1.2,
              }}
            >
              {product.tag}
            </Typography>
          )}

          {/* PRODUCT NAME */}
          <Typography
            sx={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#14342a",
              mb: 1,
            }}
          >
            {product.name}
          </Typography>

          {/* ==============================
              PACK SIZE
          ============================== */}
          <Typography
            sx={{
              mt: 2,
              mb: 1,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#14342a",
            }}
          >
            Pack Size
          </Typography>

          {activeVariants.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {activeVariants.map((variant) => {
                const selected =
                  selectedVariant?.id === variant.id;

                return (
                  <Button
                    key={variant.id}
                    onClick={() =>
                      handleVariantSelect(variant)
                    }
                    sx={{
                      minWidth: "75px",
                      border:
                        "1px solid #14342a",
                      borderRadius: "8px",
                      color: selected
                        ? "#fff"
                        : "#14342a",
                      backgroundColor: selected
                        ? "#14342a"
                        : "#fff",
                      fontWeight: 600,

                      "&:hover": {
                        backgroundColor: selected
                          ? "#0e261e"
                          : "#e4ead9",
                      },
                    }}
                  >
                    {formatUnit(variant.unit)}
                  </Button>
                );
              })}
            </Box>
          ) : (
            <Typography
              sx={{
                color: "#b23b3b",
                fontSize: "0.85rem",
              }}
            >
              No pack sizes available
            </Typography>
          )}

          {/* ==============================
              SELECTED VARIANT PRICE
          ============================== */}

          {selectedVariant ? (
            <Typography
              sx={{
                mt: 2,
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#14342a",
              }}
            >
              ₹{Number(selectedVariant.price).toFixed(2)}

              <Box
                component="span"
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 400,
                  color: "#5c554a",
                  ml: 1,
                }}
              >
                / {formatUnit(selectedVariant.unit)}
              </Box>
            </Typography>
          ) : (
            <Typography
              sx={{
                mt: 2,
                fontSize: "0.9rem",
                color: "#777",
              }}
            >
              Select a pack size
            </Typography>
          )}

          {/* ==============================
              QUANTITY
          ============================== */}
          <Typography
            sx={{
              mt: 2.5,
              mb: 1,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#14342a",
            }}
          >
            Quantity
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border:
                "1px solid rgba(20,52,42,0.2)",
              borderRadius: "10px",
              width: "150px",
              height: "45px",
            }}
          >

            {/* MINUS */}
            <IconButton
              onClick={decreaseQuantity}
              disabled={
                !selectedVariant ||
                quantity <= 1
              }
              sx={{
                color: "#14342a",
              }}
            >
              <Minus size={17} />
            </IconButton>

            {/* QUANTITY */}
            <Typography
              sx={{
                fontWeight: 600,
                color: "#14342a",
              }}
            >
              {quantity}
            </Typography>

            {/* PLUS */}
            <IconButton
              onClick={increaseQuantity}
              disabled={
                !selectedVariant ||
                quantity >= stock
              }
              sx={{
                color: "#14342a",
              }}
            >
              <Plus size={17} />
            </IconButton>
          </Box>

          {/* ==============================
              STOCK
          ============================== */}
          {selectedVariant && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                mt: 1.2,
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor:
                    stock > 0 ? "#3f6b4a" : "#b23b3b",
                  flexShrink: 0,
                }}
              />

              <Typography
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color:
                    stock > 0 ? "#3f6b4a" : "#b23b3b",
                  lineHeight: 1.2,
                }}
              >
                {stock > 0
                  ? `${stock} available`
                  : "Out of stock"}
              </Typography>
            </Box>
          )}

          {/* ==============================
              ADD TO CART
          ============================== */}
          <Button
            fullWidth
            disabled={
              !selectedVariant ||
              stock <= 0
            }
            onClick={onAddToCart}
            sx={{
              mt: 2.5,
              py: 1.4,
              borderRadius: "8px",
              backgroundColor: "#14342a",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.9rem",

              "&:hover": {
                backgroundColor: "#0e261e",
              },

              "&:disabled": {
                backgroundColor: "#ccc",
                color: "#777",
              },
            }}
          >
            {!selectedVariant
              ? "SELECT PACK SIZE"
              : stock > 0
                ? "ADD TO CART"
                : "OUT OF STOCK"}
          </Button>

        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default QuickAddModal;