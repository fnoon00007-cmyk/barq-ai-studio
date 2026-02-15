import { createRoot } from "react-dom/client";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import App from "./App.tsx";
import "./index.css";

// Global safety net for unhandled async errors
window.addEventListener("unhandledrejection", (event) => {
  console.error("[global] Unhandled rejection:", event.reason);
  event.preventDefault();
});

window.addEventListener("error", (event) => {
  console.error("[global] Uncaught error:", event.error);
});

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
