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
            background: "#17171d",
            color: "#f8fafc",
            border: "1px solid #2a2a35",
          },
          success: {
            iconTheme: { primary: "#7c3aed", secondary: "#f8fafc" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#f8fafc" },
          },
        }}
      />
    </>
  );
}

export default App;
