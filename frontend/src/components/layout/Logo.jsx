import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { Avatar, Stack, Typography } from "@mui/material";

export default function Logo({ compact = false }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      <Avatar
        sx={{
          width: 42,
          height: 42,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <FitnessCenterIcon />
      </Avatar>

      {!compact ? (
        <Stack spacing={-0.25}>
          <Typography variant="subtitle1" fontWeight={700}>
            G6
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Academia
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  );
}
