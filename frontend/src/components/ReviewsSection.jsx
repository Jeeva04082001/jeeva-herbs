import { Box, Container, Typography, Avatar } from "@mui/material";
import { Star } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { colors, cardSx, sectionPad } from "../theme/brand";

const reviews = [
  {
    text: "Taste super irukku, exactly like amma seiyra maadhiri. Kids kooda easy ah saapiduranga.",
    name: "Priya R.",
    city: "Chennai",
    rating: 5,
  },
  {
    text: "Healthy and easy to prepare — perfect for busy weekday dinners. The Modakathan soup is now a staple at home.",
    name: "Suresh K.",
    city: "Coimbatore",
    rating: 5,
  },
  {
    text: "Idly podi romba nalla irukku, no artificial taste. Ready in minutes and genuinely feels homemade.",
    name: "Lakshmi V.",
    city: "Madurai",
    rating: 5,
  },
];

function ReviewsSection() {
  return (
    <Box component="section" id="reviews" sx={{ backgroundColor: colors.cream, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="Customer Reviews" title="What families are saying" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 2.5, md: 3 },
          }}
        >
          {reviews.map((review) => (
            <Box key={review.name} sx={{ ...cardSx, display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: "flex", gap: 0.3, mb: 1.5 }}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={15} fill={colors.gold} color={colors.gold} />
                ))}
              </Box>

              <Typography
                sx={{ fontSize: "0.92rem", color: colors.ink, lineHeight: 1.7, mb: 2.5 }}
              >
                {review.text}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: "auto" }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: colors.leafPale,
                    color: colors.forest,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {review.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", color: colors.forest }}>
                    {review.name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.78rem", color: colors.inkSoft }}>
                    {review.city}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default ReviewsSection;