import { Toaster } from "react-hot-toast";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#181b22",
            color: "#f9fafb",
            border: "1px solid #262b36",
          },
          success: {
            iconTheme: { primary: "#22c55e", secondary: "#f9fafb" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#f9fafb" },
          },
        }}
      />
    </>
  );
}

export default App;
