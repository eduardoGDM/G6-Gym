import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";

export default function Topbar({ onMenuClick }) {
  const isDesktop = useMediaQuery("(min-width:900px)");

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: "none",
        backgroundImage: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          minHeight: 64,
          px: 2.5,
        }}
      >
        {/* ESQUERDA */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {!isDesktop && (
            <IconButton onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" fontWeight={700}>
            G6 Academia
          </Typography>
        </Stack>

        {/* DIREITA */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton>
            <NotificationsNoneIcon />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pl: 1,
              pr: 1.5,
              py: 0.5,
              borderRadius: 999,
              bgcolor: "background.default",
            }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              <AccountCircleIcon />
            </Avatar>

            {isDesktop && (
              <Box>
                <Typography variant="caption" fontWeight={600}>
                  Usuário
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Personal
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
