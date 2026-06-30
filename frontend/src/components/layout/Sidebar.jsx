import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import Logo from "./Logo";
import MenuItem from "./MenuItem";

export default function Sidebar({
  menuItems,
  drawerWidth,
  mobileOpen,
  onClose,
  isDesktop,
}) {
  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        backgroundImage: "none",
      }}
    >
      {/* HEADER */}
      <Toolbar
        sx={{
          px: 2.5,
          minHeight: 64,
        }}
      >
        <Logo />
      </Toolbar>

      <Divider />

      {/* MENU */}
      <List sx={{ px: 1.5, pt: 1.5, flexGrow: 1 }}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            item={item}
            onClick={!isDesktop ? onClose : undefined}
          />
        ))}
      </List>

      {/* FOOTER */}
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: "background.default",
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Modo
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isDesktop ? "Desktop" : "Mobile"}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{ display: { md: "none" } }}
          >
            <MenuRoundedIcon />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant={isDesktop ? "persistent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: "block",
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            bgcolor: "background.paper",
            backgroundImage: "none",
            boxShadow: "none",
            borderRight: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
