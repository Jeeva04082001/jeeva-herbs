import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

function AddProduct() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tag: "",
    category: "",
    description: "",
    ingredients: "",
    price: "",
    unit: "",
    stock: "",
    image_url: "",
    hover_image_url: "",
    is_active: true,
  });

  const [variants, setVariants] = useState([
    {
      unit: "50g",
      price: "",
      stock: "",
      is_active: true,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [selectedHoverImage, setSelectedHoverImage] =
    useState(null);

  const [hoverImagePreview, setHoverImagePreview] =
    useState("");

  // ---------------------------------------------------------
  // FORM CHANGE
  // ---------------------------------------------------------

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // ---------------------------------------------------------
  // VARIANT CHANGE
  // ---------------------------------------------------------

  function handleVariantChange(index, field, value) {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  // ---------------------------------------------------------
  // ADD VARIANT
  // ---------------------------------------------------------

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        unit: "",
        price: "",
        stock: "",
        is_active: true,
      },
    ]);
  }

  // ---------------------------------------------------------
  // REMOVE VARIANT
  // ---------------------------------------------------------

  function removeVariant(index) {
    setVariants((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      // ---------------------------------------------------
      // 1. VALIDATE VARIANTS
      // ---------------------------------------------------

      const formattedVariants = variants
        .filter(
          (variant) =>
            variant.unit &&
            variant.price !== ""
        )
        .map((variant) => ({
          unit: variant.unit.trim(),
          price: Number(variant.price),
          stock: Number(variant.stock || 0),
          is_active: variant.is_active ?? true,
        }));

      if (formattedVariants.length === 0) {
        toast.error(
          "Please add at least one pack size with price"
        );

        setLoading(false);
        return;
      }

      // ---------------------------------------------------
      // 2. UPLOAD MAIN IMAGE
      // ---------------------------------------------------

      let imageUrl = "";

      if (selectedImage) {
        const imageData = new FormData();

        imageData.append("file", selectedImage);

        const uploadResponse = await api.post(
          "/api/products/upload-image",
          imageData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imageUrl =
          uploadResponse.data.image_url || "";

        if (!imageUrl) {
          throw new Error(
            "Main image upload failed"
          );
        }
      }

      // ---------------------------------------------------
      // 3. UPLOAD HOVER IMAGE
      // ---------------------------------------------------

      let hoverImageUrl = "";

      if (selectedHoverImage) {
        const hoverImageData = new FormData();

        hoverImageData.append(
          "file",
          selectedHoverImage
        );

        const hoverUploadResponse =
          await api.post(
            "/api/products/upload-image",
            hoverImageData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        hoverImageUrl =
          hoverUploadResponse.data.image_url || "";
      }

      // ---------------------------------------------------
      // 4. CREATE PRODUCT PAYLOAD
      // ---------------------------------------------------

      const firstVariant =
        formattedVariants[0];

      const payload = {
        name: formData.name.trim(),

        slug: formData.slug.trim(),

        tag: formData.tag.trim(),

        category: formData.category.trim(),

        description:
          formData.description.trim(),

        ingredients:
          formData.ingredients
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

        // -----------------------------------------------
        // Legacy Product fields
        // First active/first variant values
        // -----------------------------------------------

        price: firstVariant.price,

        unit: firstVariant.unit,

        stock: firstVariant.stock,

        // -----------------------------------------------
        // IMPORTANT
        // Uploaded image URLs
        // -----------------------------------------------

        image_url: imageUrl,

        hover_image_url: hoverImageUrl,

        is_active: formData.is_active,

        // -----------------------------------------------
        // Product Variants
        // -----------------------------------------------

        variants: formattedVariants,
      };

      console.log(
        "PRODUCT CREATE PAYLOAD:",
        payload
      );

      // ---------------------------------------------------
      // 5. CREATE PRODUCT
      // ---------------------------------------------------

      const response = await api.post(
        "/api/products",
        payload
      );

      console.log(
        "PRODUCT CREATED:",
        response.data
      );

      toast.success(
        "Product added successfully!"
      );

      navigate("/admin");
    } catch (error) {
      console.error(
        "Add product failed:",
        error
      );

      console.error(
        "Backend response:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.detail ||
          "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f7f1e3",
        py: { xs: 5, md: 8 },
      }}
    >
      <Container maxWidth="md">

        <Typography
          sx={{
            fontWeight: 600,
            fontSize: {
              xs: "1.8rem",
              md: "2.2rem",
            },
            color: "#14342a",
            mb: 4,
          }}
        >
          Add Product
        </Typography>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: "22px",
            border:
              "1px solid rgba(20,52,42,0.1)",
          }}
        >
          <Grid container spacing={2.5}>

            {/* PRODUCT NAME */}

            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Product Name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
                sx={fieldStyle}
              />
            </Grid>

            {/* SLUG */}

            <Grid item xs={12} sm={6}>
              <TextField
                name="slug"
                label="Slug"
                placeholder="product-slug"
                value={formData.slug}
                onChange={handleChange}
                fullWidth
                sx={fieldStyle}
              />
            </Grid>

            {/* TAG */}

            <Grid item xs={12} sm={6}>
              <TextField
                name="tag"
                label="Tag"
                placeholder="Best Seller"
                value={formData.tag}
                onChange={handleChange}
                fullWidth
                sx={fieldStyle}
              />
            </Grid>

            {/* CATEGORY */}

            <Grid item xs={12} sm={6}>
              <TextField
                name="category"
                label="Category"
                placeholder="Soup / Podi"
                value={formData.category}
                onChange={handleChange}
                required
                fullWidth
                sx={fieldStyle}
              />
            </Grid>

            {/* DESCRIPTION */}

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                placeholder="Product description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                sx={fieldStyle}
              />
            </Grid>

            {/* INGREDIENTS */}

            <Grid item xs={12}>
              <TextField
                name="ingredients"
                label="Ingredients"
                placeholder="Moringa, Curry Leaves, Pepper"
                value={formData.ingredients}
                onChange={handleChange}
                fullWidth
                helperText="Separate ingredients using commas."
                sx={fieldStyle}
              />
            </Grid>

            {/* ------------------------------------------------ */}
            {/* PACK SIZES */}
            {/* ------------------------------------------------ */}

            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 1,
                  p: 3,
                  borderRadius: "18px",
                  border:
                    "1px solid rgba(20,52,42,0.12)",
                  backgroundColor: "#faf8f1",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2.5 }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.15rem",
                        color: "#14342a",
                      }}
                    >
                      Pack Sizes
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        color: "#6b665d",
                        mt: 0.5,
                      }}
                    >
                      Add different pack sizes,
                      prices and stock.
                    </Typography>
                  </Box>

                  <Button
                    type="button"
                    onClick={addVariant}
                    sx={{
                      color: "#14342a",
                      fontWeight: 700,
                      border:
                        "1px solid #14342a",
                      borderRadius: "100px",
                      px: 2,
                    }}
                  >
                    + Add Size
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {variants.map(
                    (variant, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          borderRadius: "14px",
                          backgroundColor: "#fff",
                          border:
                            "1px solid rgba(20,52,42,0.08)",
                        }}
                      >
                        <Grid
                          container
                          spacing={2}
                          alignItems="center"
                        >

                          {/* PACK SIZE */}

                          <Grid
                            item
                            xs={12}
                            sm={4}
                          >
                            <TextField
                              label="Pack Size"
                              placeholder="50g"
                              value={
                                variant.unit
                              }
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  "unit",
                                  e.target.value
                                )
                              }
                              fullWidth
                              required
                              sx={fieldStyle}
                            />
                          </Grid>

                          {/* PRICE */}

                          <Grid
                            item
                            xs={12}
                            sm={3}
                          >
                            <TextField
                              label="Price"
                              type="number"
                              placeholder="40"
                              value={
                                variant.price
                              }
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  "price",
                                  e.target.value
                                )
                              }
                              fullWidth
                              required
                              inputProps={{
                                min: 0,
                              }}
                              sx={fieldStyle}
                            />
                          </Grid>

                          {/* STOCK */}

                          <Grid
                            item
                            xs={12}
                            sm={3}
                          >
                            <TextField
                              label="Stock"
                              type="number"
                              placeholder="50"
                              value={
                                variant.stock
                              }
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  "stock",
                                  e.target.value
                                )
                              }
                              fullWidth
                              required
                              inputProps={{
                                min: 0,
                              }}
                              sx={fieldStyle}
                            />
                          </Grid>

                          {/* REMOVE */}

                          <Grid
                            item
                            xs={12}
                            sm={2}
                          >
                            {variants.length >
                              1 && (
                              <Button
                                type="button"
                                onClick={() =>
                                  removeVariant(
                                    index
                                  )
                                }
                                sx={{
                                  color:
                                    "#b23b3b",
                                  fontWeight: 600,
                                }}
                              >
                                Remove
                              </Button>
                            )}
                          </Grid>

                        </Grid>
                      </Box>
                    )
                  )}
                </Stack>
              </Box>
            </Grid>

            {/* ------------------------------------------------ */}
            {/* PRODUCT IMAGE */}
            {/* ------------------------------------------------ */}

            <Grid item xs={12}>
              <Typography
                sx={{
                  color: "#14342a",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Product Image
              </Typography>

              <Box
                sx={{
                  border:
                    "2px dashed rgba(20,52,42,0.2)",
                  borderRadius: "16px",
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "#faf8f1",
                }}
              >
                <Button
                  component="label"
                  variant="outlined"
                  sx={{
                    borderColor: "#14342a",
                    color: "#14342a",
                    borderRadius: "100px",
                    px: 3,
                    py: 1.2,
                    fontWeight: 600,
                  }}
                >
                  Choose Product Image

                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      if (!file) return;

                      if (
                        file.size >
                        5 * 1024 * 1024
                      ) {
                        toast.error(
                          "Image must be less than 5 MB"
                        );
                        return;
                      }

                      setSelectedImage(file);

                      setImagePreview(
                        URL.createObjectURL(
                          file
                        )
                      );
                    }}
                  />
                </Button>

                {imagePreview && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Product preview"
                      sx={{
                        width: 220,
                        height: 220,
                        objectFit: "cover",
                        borderRadius: "14px",
                        border:
                          "1px solid rgba(20,52,42,0.1)",
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* ------------------------------------------------ */}
            {/* HOVER PRODUCT IMAGE */}
            {/* ------------------------------------------------ */}

            <Grid item xs={12}>
              <Typography
                sx={{
                  color: "#14342a",
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Hover Product Image
              </Typography>

              <Box
                sx={{
                  border:
                    "2px dashed rgba(20,52,42,0.2)",
                  borderRadius: "16px",
                  p: 3,
                  textAlign: "center",
                  backgroundColor: "#faf8f1",
                }}
              >
                <Button
                  component="label"
                  variant="outlined"
                  sx={{
                    color: "#14342a",
                    borderColor: "#14342a",
                    "&:hover": {
                      borderColor: "#3f6b4a",
                      backgroundColor:
                        "rgba(63,107,74,0.05)",
                    },
                  }}
                >
                  Choose Hover Image

                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file =
                        e.target.files?.[0];

                      if (!file) return;

                      if (
                        file.size >
                        5 * 1024 * 1024
                      ) {
                        toast.error(
                          "Image must be less than 5 MB"
                        );
                        return;
                      }

                      setSelectedHoverImage(
                        file
                      );

                      setHoverImagePreview(
                        URL.createObjectURL(
                          file
                        )
                      );
                    }}
                  />
                </Button>

                {hoverImagePreview && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      component="img"
                      src={hoverImagePreview}
                      alt="Hover product preview"
                      sx={{
                        width: 220,
                        height: 220,
                        objectFit: "cover",
                        borderRadius: "14px",
                        border:
                          "1px solid rgba(20,52,42,0.1)",
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* ------------------------------------------------ */}
            {/* ACTIVE */}
            {/* ------------------------------------------------ */}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_active"
                    checked={
                      formData.is_active
                    }
                    onChange={handleChange}
                    sx={{
                      color: "#7fa06f",
                      "&.Mui-checked": {
                        color: "#14342a",
                      },
                    }}
                  />
                }
                label="Product Active"
                sx={{
                  color: "#5c554a",
                }}
              />
            </Grid>

          </Grid>

          {/* ------------------------------------------------ */}
          {/* BUTTONS */}
          {/* ------------------------------------------------ */}

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 4 }}
          >
            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              sx={{
                backgroundColor: "#14342a",
                color: "#f7f1e3",
                borderRadius: "100px",
                px: 4,
                py: 1.3,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#0e261e",
                },
              }}
            >
              {loading
                ? "Adding..."
                : "Add Product"}
            </Button>

            <Button
              type="button"
              onClick={() =>
                navigate("/admin/products")
              }
              sx={{
                color: "#5c554a",
                borderRadius: "100px",
                px: 4,
                py: 1.3,
                fontWeight: 600,
                border:
                  "1px solid rgba(20,52,42,0.15)",
              }}
            >
              Cancel
            </Button>
          </Stack>

        </Paper>
      </Container>
    </Box>
  );
}

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",

    "& fieldset": {
      borderColor:
        "rgba(20,52,42,0.15)",
    },

    "&:hover fieldset": {
      borderColor: "#7fa06f",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#14342a",
    },
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: "#14342a",
  },
};

export default AddProduct;