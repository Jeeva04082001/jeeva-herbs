import { useEffect, useState } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/carousel/hero-1.png",
    link: "/products",
  },
  {
    image: "/carousel/hero-2.png",
    link: "/products",
  },
  {
    image: "/carousel/hero-3.png",
    link: "/products",
  },
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#f7f1e3",
      }}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <Box
          key={slide.image}
          component="a"
          href={slide.link}
          sx={{
            display: index === currentSlide ? "block" : "none",
            width: "100%",
            lineHeight: 0,
            cursor: "pointer",
          }}
        >
          <Box
            component="img"
            src={slide.image}
            alt={`Jeeva Herbs ${index + 1}`}
            sx={{
              display: "block",
              width: "100%",
              height: "auto",
              objectFit: "cover",
            }}
          />
        </Box>
      ))}

      {/* Previous button */}
      <IconButton
        onClick={previousSlide}
        aria-label="Previous slide"
        sx={{
          position: "absolute",
          left: { xs: 10, md: 24 },
          top: "50%",
          transform: "translateY(-50%)",
          width: { xs: 36, md: 48 },
          height: { xs: 36, md: 48 },
          backgroundColor: "rgba(255,255,255,0.8)",
          color: "#14342a",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.95)",
          },
        }}
      >
        <ChevronLeft size={26} />
      </IconButton>

      {/* Next button */}
      <IconButton
        onClick={nextSlide}
        aria-label="Next slide"
        sx={{
          position: "absolute",
          right: { xs: 10, md: 24 },
          top: "50%",
          transform: "translateY(-50%)",
          width: { xs: 36, md: 48 },
          height: { xs: 36, md: 48 },
          backgroundColor: "rgba(255,255,255,0.8)",
          color: "#14342a",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,0.95)",
          },
        }}
      >
        <ChevronRight size={26} />
      </IconButton>

      {/* Dots */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 10, md: 18 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentSlide(index)}
            sx={{
              width: index === currentSlide ? 26 : 9,
              height: 9,
              borderRadius: "20px",
              backgroundColor:
                index === currentSlide
                  ? "#14342a"
                  : "rgba(20,52,42,0.35)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default Hero;