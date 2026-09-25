import { Box, Container, Typography } from "@mui/material";
import { FileText, Home, SprayCan } from "lucide-react";
import { colors, sectionPad } from "../theme/brand";

const badges = [
  { icon: FileText, label: "FSSAI registration", note: "Coming soon" },
  { icon: Home, label: "Homemade", note: "Small-batch made" },
  { icon: SprayCan, label: "Hygienically packed", note: "Sealed fresh" },
];

function CertificationsSection() {
  return (
    <Box component="section" sx={{ backgroundColor: colors.cream, py: { xs: 5, md: 7 } }}>
      <Container maxWidth="md">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 2,
          }}
        >
          {badges.map(({ icon: Icon, label, note }) => (
            <Box
              key={label}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                border: `1px solid ${colors.line}`,
                borderRadius: "16px",
                px: 2.5,
                py: 2,
              }}
            >
              <Icon size={22} color={colors.moss} strokeWidth={1.6} />
              <Box>
                <Typography sx={{ fontWeight: 600, color: colors.forest, fontSize: "0.9rem" }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: colors.inkSoft }}>{note}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

export default CertificationsSection;