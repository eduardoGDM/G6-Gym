import { Stack, Typography } from "@mui/material";

export default function PageTitle({ title, description }) {
  return (
    <Stack spacing={0.75} sx={{ mb: { xs: 2.5, md: 3 } }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      {description ? (
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      ) : null}
    </Stack>
  );
}
