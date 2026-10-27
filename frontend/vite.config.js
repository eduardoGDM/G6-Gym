import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Escuta em todas as interfaces de rede (0.0.0.0) em vez de apenas
    // localhost, para abrir o app pelo IP da máquina em outros dispositivos
    // (celular, tablet) na mesma rede.
    host: true,
    // A porta é fixa porque o IP:porta do frontend precisa bater com
    // SANCTUM_STATEFUL_DOMAINS / FRONTEND_URL no backend. Se a 5173 estiver
    // ocupada, falha em vez de trocar de porta silenciosamente.
    port: 5173,
    strictPort: true,
  },
  build: {
    // Separa dependências grandes em chunks próprios: eles mudam com menos
    // frequência que o código da aplicação, então o navegador consegue
    // reaproveitar o cache entre deploys e o bundle inicial fica menor.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/.test(id)) {
            return "react-vendor";
          }
          if (id.includes("recharts") || id.includes("d3-")) {
            return "charts-vendor";
          }
          if (/[\\/]node_modules[\\/](react-hook-form|@hookform|yup)[\\/]/.test(id)) {
            return "form-vendor";
          }
          return undefined;
        },
      },
    },
    // Evita avisos ruidosos; os chunks pesados (ex.: charts) são carregados
    // sob demanda pelas rotas lazy.
    chunkSizeWarningLimit: 900,
  },
});
