import { useState } from "react";
import { useNavigate } from "react-router-dom";

import authService from "../services/authService";
import useAuthStore from "../store/authStore";

/**
 * Encerra a sessão: avisa o backend, limpa o store e volta para o login.
 *
 * Vive num hook porque há dois pontos de saída — o rodapé da sidebar (desktop)
 * e a tela de perfil do aluno (único caminho no mobile, onde a gaveta deu lugar
 * à barra inferior).
 *
 * A falha do backend não impede a saída local: a sessão do navegador tem de
 * terminar de qualquer forma, senão o aluno fica preso numa conta que ele já
 * pediu para sair.
 */
export function useLogout() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);

    try {
      await authService.logout();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Backend logout falhou:", error);
      }
    } finally {
      logout();
      navigate("/");
      setLoading(false);
    }
  };

  return { logout: run, loading };
}

export default useLogout;
