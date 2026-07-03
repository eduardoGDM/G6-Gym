import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";

export default function LogoutPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const runLogout = async () => {
      try {
        await authService.logout();
      } catch {
        //
      }

      setUser(null);

      navigate("/", { replace: true });
    };

    runLogout();
  }, [navigate, setUser]);

  return null;
}
