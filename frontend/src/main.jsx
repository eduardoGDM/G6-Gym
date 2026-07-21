import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Configuração global do React Query.
//
// - staleTime: enquanto os dados estiverem "frescos" o cache é servido sem
//   refazer a requisição, evitando chamadas repetidas ao remontar componentes
//   ou trocar de página.
// - gcTime: mantém o cache inativo em memória por alguns minutos, tornando a
//   navegação de volta instantânea.
// - refetchOnWindowFocus: desligado — sem isso qualquer troca de foco da janela
//   dispara um refetch de TODAS as queries montadas.
// - retry: 1 tentativa evita cascata de re-tentativas em erros previsíveis (4xx).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
