import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
