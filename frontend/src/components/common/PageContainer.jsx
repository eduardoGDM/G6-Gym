import { Box, Container } from "@mui/material";

export default function PageContainer({ children, sx = {} }) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        px: { xs: 2, sm: 3, md: 0 },
        py: { xs: 2, sm: 3, md: 4 },
        ...sx,
      }}
    >
      <Container maxWidth="xl">{children}</Container>
    </Box>
  );
}
