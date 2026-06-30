import { ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

export default function MenuItem({ item, onClick }) {
  const location = useLocation();
  const selected =
    location.pathname === item.path ||
    location.pathname.startsWith(`${item.path}/`);

  return (
    <ListItemButton
      component={NavLink}
      to={item.path}
      onClick={onClick}
      selected={selected}
      sx={{
        borderRadius: 2,
        mb: 0.75,
        color: "text.secondary",
        px: 1.5,
        py: 1,
        "&.Mui-selected": {
          bgcolor: "action.selected",
          color: "text.primary",
        },
      }}
    >
      <ListItemIcon
        sx={{ minWidth: 36, color: selected ? "primary.main" : "inherit" }}
      >
        {item.icon}
      </ListItemIcon>
      <ListItemText primary={item.label} />
    </ListItemButton>
  );
}
