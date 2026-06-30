import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const DRAWER_WIDTH = 280;

export default function RoleLayout({ menuItems, title }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Sidebar
        menuItems={menuItems}
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={handleDrawerClose}
        isDesktop={isDesktop}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: {
            xs: 0,
            md: `${DRAWER_WIDTH}px`,
          },
          width: {
            xs: "100%",
            md: `calc(100% - ${DRAWER_WIDTH}px)`,
          },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar
          title={title}
          onMenuClick={handleDrawerToggle}
          drawerWidth={DRAWER_WIDTH}
          isDesktop={isDesktop}
        />

        <Box
          sx={{
            flexGrow: 1,
            pt: { xs: 8, md: 9 },
            px: { xs: 2, sm: 3, md: 4 },
            pb: 3,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
