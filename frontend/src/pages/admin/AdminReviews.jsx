import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Chip,
  IconButton,
  Skeleton,
  Tooltip,
  Rating,
  Divider,
} from "@mui/material";

import {
  Star,
  RefreshCw,
  MessageSquareText,
} from "lucide-react";

import api from "../../services/api";
import { colors, fonts } from "../../theme/brand";

const ADMIN_RADIUS = "16px";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);

      const response = await api.get("/api/admin/reviews");

      setReviews(response.data || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.creamDeep,
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">

        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: colors.moss,
                mb: 0.5,
              }}
            >
              Store Management
            </Typography>

            <Typography
              sx={{
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                color: colors.forest,
              }}
            >
              Customer Reviews
            </Typography>

            <Typography
              sx={{
                fontSize: "0.9rem",
                color: colors.inkSoft,
                mt: 0.5,
              }}
            >
              View customer feedback and product ratings.
            </Typography>
          </Box>

          <Tooltip title="Refresh reviews">
            <span>
              <IconButton
                onClick={fetchReviews}
                disabled={loading}
                sx={{
                  backgroundColor: colors.forest,
                  color: colors.cream,
                  borderRadius: "10px",
                  p: 1.2,
                  "&:hover": {
                    backgroundColor: "#0e261e",
                  },
                }}
              >
                <RefreshCw
                  size={18}
                  style={{
                    animation: loading
                      ? "reviewSpin 0.9s linear infinite"
                      : "none",
                  }}
                />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              "@keyframes reviewSpin": {
                from: {
                  transform: "rotate(0deg)",
                },
                to: {
                  transform: "rotate(360deg)",
                },
              },
            }}
          />
        </Box>

        {/* REVIEW COUNT */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: ADMIN_RADIUS,
            backgroundColor: "#fff",
            p: 2.5,
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.leafPale,
              color: colors.moss,
            }}
          >
            <MessageSquareText size={20} />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: colors.inkSoft,
                fontWeight: 600,
              }}
            >
              Total Reviews
            </Typography>

            {loading ? (
              <Skeleton width={50} height={32} />
            ) : (
              <Typography
                sx={{
                  fontFamily: fonts.display,
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: colors.forest,
                  lineHeight: 1.1,
                }}
              >
                {reviews.length}
              </Typography>
            )}
          </Box>
        </Card>

        {/* REVIEWS */}
        <Card
          elevation={0}
          sx={{
            border: `1px solid ${colors.line}`,
            borderRadius: ADMIN_RADIUS,
            backgroundColor: "#fff",
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography
              sx={{
                fontFamily: fonts.display,
                fontSize: "1.2rem",
                fontWeight: 600,
                color: colors.forest,
              }}
            >
              All Customer Reviews
            </Typography>
          </Box>

          <Divider />

          {loading ? (
            <Box sx={{ p: 3 }}>
              {[1, 2, 3].map((item) => (
                <Box key={item} sx={{ mb: 3 }}>
                  <Skeleton width="35%" height={28} />
                  <Skeleton width="25%" height={22} />
                  <Skeleton width="80%" height={24} />
                </Box>
              ))}
            </Box>
          ) : reviews.length === 0 ? (
            <Box
              sx={{
                p: 6,
                textAlign: "center",
              }}
            >
              <Star
                size={38}
                strokeWidth={1.5}
                color={colors.moss}
              />

              <Typography
                sx={{
                  mt: 1.5,
                  fontWeight: 600,
                  color: colors.forest,
                }}
              >
                No reviews yet
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "0.9rem",
                  color: colors.inkSoft,
                }}
              >
                Customer reviews will appear here.
              </Typography>
            </Box>
          ) : (
            <Box>
              {reviews.map((review, index) => (
                <Box
                  key={review.id}
                  sx={{
                    p: { xs: 2, md: 3 },
                    borderBottom:
                      index !== reviews.length - 1
                        ? `1px solid ${colors.line}`
                        : "none",
                  }}
                >
                  {/* TOP ROW */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: {
                        xs: "flex-start",
                        sm: "center",
                      },
                      gap: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: colors.forest,
                          fontSize: "1rem",
                        }}
                      >
                        {review.product_name}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          color: colors.inkSoft,
                          mt: 0.3,
                        }}
                      >
                        by {review.user_name}
                      </Typography>
                    </Box>

                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                    />
                  </Box>

                  {/* REVIEW TEXT */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: "12px",
                      backgroundColor: colors.leafPale,
                    }}
                  >
                    <Typography
                      sx={{
                        color: colors.ink,
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {review.review || "No written review"}
                    </Typography>
                  </Box>

                  {/* DETAILS */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      mt: 1.5,
                    }}
                  >
                    <Chip
                      label={`Order: ${review.order_number}`}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(20,52,42,0.08)",
                        color: colors.forest,
                        fontWeight: 600,
                      }}
                    />

                    <Chip
                      label={formatDate(review.created_at)}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(63,107,74,0.10)",
                        color: colors.moss,
                        fontWeight: 600,
                      }}
                    />

                    <Chip
                      label={
                        review.is_approved
                          ? "Approved"
                          : "Hidden"
                      }
                      size="small"
                      sx={{
                        backgroundColor: review.is_approved
                          ? "rgba(63,107,74,0.12)"
                          : "rgba(161,92,51,0.12)",
                        color: review.is_approved
                          ? colors.moss
                          : colors.clay,
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}

export default AdminReviews;