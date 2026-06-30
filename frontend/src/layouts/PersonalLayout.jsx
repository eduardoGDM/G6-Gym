import { Box, useMediaQuery } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const drawerWidth = 280;

const menuItems = [
  { label: "Dashboard", path: "/personal" },
  { label: "Alunos", path: "/personal/alunos" },
  { label: "Treinos", path: "/personal/treinos" },
  { label: "Exercícios", path: "/personal/exercicios" },
];

export default function PersonalLayout() {
  const isDesktop = useMediaQuery("(min-width:900px)");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* SIDEBAR */}
      <Sidebar
        menuItems={menuItems}
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        isDesktop={isDesktop}
      />

      {/* CONTEÚDO */}
      <Box sx={{ flexGrow: 1 }}>
        {/* TOPBAR */}
        <Topbar onMenuClick={handleDrawerToggle} />

        {/* PÁGINAS */}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
