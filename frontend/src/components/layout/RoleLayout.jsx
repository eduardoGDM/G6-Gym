import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./TopBar";

const DRAWER_WIDTH = 280;

export default function RoleLayout({
  menuItems,
  title,
  roleLabel,
  banner,
  profilePath,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= 900 : true,
  );
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar
        menuItems={menuItems}
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isDesktop={isDesktop}
        roleLabel={roleLabel}
      />

      <div className={isDesktop ? "pl-[280px]" : "pl-0"}>
        <Topbar
          title={title || "G6Fit"}
          onMenuClick={() => setMobileOpen((prev) => !prev)}
          isDesktop={isDesktop}
          roleLabel={roleLabel}
          profilePath={profilePath}
        />

        <main className="px-4 pt-0 pb-6 sm:px-6 lg:px-8 lg:pt-0 lg:pb-8">
          {banner}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
