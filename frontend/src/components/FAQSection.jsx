import { useState } from "react";
import { Box, Container, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import { ChevronDown } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { colors, sectionPad } from "../theme/brand";

const faqs = [
  {
    q: "How do I prepare Jeeva soup premix?",
    a: "Boil 2 cups of water, add 2 spoons of the premix, simmer for 5–10 minutes stirring occasionally, and serve hot.",
  },
  {
    q: "What is the shelf life?",
    a: "Each pack stays fresh for 6 months from the date of packing when stored in a cool, dry place.",
  },
  {
    q: "How should I store it after opening?",
    a: "Reseal the pouch tightly and keep it away from direct sunlight and moisture. An airtight container works best.",
  },
  {
    q: "Do you deliver across Tamil Nadu?",
    a: "Yes — we deliver across Tamil Nadu and select pan-India locations. Message us on WhatsApp with your pincode to confirm.",
  },
  {
    q: "Is it suitable for kids?",
    a: "Yes, it's generally suitable for children as part of a balanced diet. For toddlers or specific health concerns, please check with your paediatrician.",
  },
  {
    q: "Can diabetics consume it?",
    a: "Our soups don't contain added sugar, but we recommend consulting your doctor before adding any new food to a diabetes-management diet.",
  },
  {
    q: "Is it spicy?",
    a: "It has a mild, home-style spice level. You can adjust pepper and salt to taste while preparing.",
  },
  {
    q: "Can pregnant women consume it?",
    a: "Our ingredients are natural and traditional, but we always recommend checking with your doctor during pregnancy before adding new foods.",
  },
  {
    q: "Is it vegan?",
    a: "Yes, all Jeeva soup premixes are plant-based and vegan-friendly.",
  },
  {
    q: "Is it gluten free?",
    a: "Our core soup premixes don't contain wheat-based ingredients. Please confirm with us directly for the most current ingredient list.",
  },
  {
    q: "How many servings are in one pack?",
    a: "Each 200g pack makes approximately 8–10 servings, depending on how thick you prepare it.",
  },
];

function FAQSection() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box component="section" id="faq" sx={{ backgroundColor: colors.creamDeep, ...sectionPad }}>
      <Container maxWidth="md">
        <SectionHeader eyebrow="Good to Know" title="Frequently asked questions" />

        {faqs.map((faq, index) => (
          <Accordion
            key={faq.q}
            expanded={expanded === index}
            onChange={handleChange(index)}
            disableGutters
            elevation={0}
            sx={{
              backgroundColor: "#fff",
              border: `1px solid ${colors.line}`,
              borderRadius: "16px !important",
              mb: 1.5,
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary
              expandIcon={<ChevronDown size={18} color={colors.moss} />}
              sx={{ px: { xs: 2, md: 3 }, py: 1 }}
            >
              <Typography sx={{ fontWeight: 600, color: colors.forest, fontSize: "0.95rem" }}>
                {faq.q}
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2.5, pt: 0 }}>
              <Typography sx={{ fontSize: "0.9rem", color: colors.inkSoft, lineHeight: 1.75 }}>
                {faq.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}

export default FAQSection;