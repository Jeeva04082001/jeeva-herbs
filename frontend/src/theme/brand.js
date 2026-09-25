// Single source of truth for brand colours, fonts and contact links.
// Change a value here and every section updates.

export const colors = {
  forest: "#14342a",
  moss: "#3f6b4a",
  leaf: "#7fa06f",
  leafPale: "#e4ead9",
  cream: "#f7f1e3",
  creamDeep: "#efe6d0",
  clay: "#a15c33",
  gold: "#c99a3e",
  ink: "#2a2620",
  inkSoft: "#5c554a",
  line: "rgba(20,52,42,0.12)",
};

export const fonts = {
  display: "'Fraunces', Georgia, serif",
  body: "'Work Sans', system-ui, sans-serif",
};

export const RADIUS = "22px";

export const WHATSAPP_NUMBER = "918681040801";
export const PHONE_NUMBER = "8681040801";
export const INSTAGRAM_HANDLE = "@your_instagram_handle";

export const waLink = (message = "Hi Jeeva Herbs, I would like to place an order.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

// Reused vertical rhythm so every section breathes the same way.
export const sectionPad = { py: { xs: 7, md: 11 } };

// Soft card surface used across sections.
export const cardSx = {
  backgroundColor: "#fff",
  border: `1px solid ${colors.line}`,
  borderRadius: RADIUS,
  p: { xs: 2.5, md: 3 },
  height: "100%",
};