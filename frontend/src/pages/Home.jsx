import { Box, GlobalStyles } from "@mui/material";

import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductPreview from "../components/ProductPreview";
import WhyJeeva from "../components/WhyJeeva";
import ReviewsSection from "../components/ReviewsSection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

import { colors } from "../theme/brand";

const resetStarterStyles = (
  <GlobalStyles
    styles={{
      "#root": {
        maxWidth: "none !important",
        margin: "0 !important",
        padding: "0 !important",
        textAlign: "left !important",
        width: "100%",
      },

      body: {
        margin: 0,
        backgroundColor: colors.cream,
      },
    }}
  />
);

function Home() {
  return (
    <>
      {resetStarterStyles}

      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          backgroundColor: colors.cream,
        }}
      >
        {/* Top */}
        <AnnouncementBar />
        <Navbar />

        {/* 1. Hero Carousel */}
        <Hero />

        {/* 2. Best Sellers / Products */}
        <ProductPreview />

        {/* 3. Why Jeeva Herbs */}
        <WhyJeeva />

        {/* 4. Customer Reviews */}
        <ReviewsSection />

        {/* 5. FAQ */}
        <FAQSection />

        {/* Bottom */}
        <Footer />
        <WhatsAppButton />
      </Box>
    </>
  );
}

export default Home;