import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import SectionHeader from "./SectionHeader";
import { colors, sectionPad, RADIUS } from "../theme/brand";

const columns = ["Product", "Serving Size", "Calories", "Protein", "Iron", "Calcium"];

const rows = [
  ["Murungai Keerai Soup", "20g (1 serving)", "65 kcal", "2.8g", "3.2mg", "110mg"],
  ["Modakathan Soup", "20g (1 serving)", "70 kcal", "3.0g", "2.1mg", "60mg"],
  ["Thoothuvalai Soup", "20g (1 serving)", "62 kcal", "2.5g", "2.6mg", "75mg"],
  ["Idly Podi", "15g (1 serving)", "58 kcal", "2.2g", "1.8mg", "45mg"],
];

function NutritionSection() {
  return (
    <Box component="section" id="nutrition" sx={{ backgroundColor: colors.cream, ...sectionPad }}>
      <Container maxWidth="lg">
        <SectionHeader eyebrow="Nutrition Info" title="Approximate values per serving" />

        <Box
          sx={{
            backgroundColor: "#fff",
            border: `1px solid ${colors.line}`,
            borderRadius: RADIUS,
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.leafPale }}>
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    sx={{ fontWeight: 700, color: colors.forest, borderBottom: "none" }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row[0]}>
                  {row.map((cell, i) => (
                    <TableCell
                      key={cell + i}
                      sx={{
                        color: i === 0 ? colors.forest : colors.inkSoft,
                        fontWeight: i === 0 ? 600 : 400,
                        fontSize: "0.9rem",
                        borderBottom: `1px solid ${colors.line}`,
                      }}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Typography sx={{ mt: 2, fontSize: "0.8rem", color: colors.inkSoft, textAlign: "center" }}>
          Approximate values, to be confirmed by lab testing before publishing.
        </Typography>
      </Container>
    </Box>
  );
}

export default NutritionSection;