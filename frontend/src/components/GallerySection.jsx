import { Box, Container, Typography } from "@mui/material";
import { Camera } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { colors, sectionPad } from "../theme/brand";

/**
 * Pass real photos like:
 *   <GallerySection images={[{ src: "/images/packet.jpg", alt: "Murungai packet" }]} />
 * Until then, placeholder tiles keep the layout honest.
 */
const placeholders = [
  "Product packet",
  "Fresh herbs",
  "Stone grinding",
  "Sun drying",
  "Packing",
  "Served hot",
];

function GallerySection({ images = [] }) {
  const tiles = images.length ? images : placeholders;

  return (
    <Box component="section" id="gallery" sx={{ backgroundColor: colors.creamDeep, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="Gallery" title="Product, ingredients & packing" />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
            gap: { xs: 1.5, md: 2.5 },
          }}
        >
          {tiles.map((tile, index) => {
            const isImage = typeof tile === "object";
            return (
              <Box
                key={isImage ? tile.src : tile + index}
                sx={{
                  aspectRatio: "4 / 3",
                  borderRadius: "18px",
                  overflow: "hidden",
                  backgroundColor: colors.leafPale,
                  border: `1px solid ${colors.line}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  color: colors.moss,
                }}
              >
                {isImage ? (
                  <Box
                    component="img"
                    src={tile.src}
                    alt={tile.alt || ""}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <>
                    <Camera size={22} strokeWidth={1.5} />
                    <Typography sx={{ fontSize: "0.8rem", color: colors.inkSoft }}>
                      {tile}
                    </Typography>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

export default GallerySection;