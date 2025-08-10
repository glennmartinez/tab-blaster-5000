import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ExtensionPopup } from "./components";

// Determine which view to render based on URL parameter
const urlParams = new URLSearchParams(window.location.search);
const view = urlParams.get("view");
const isFullPageView = view === "fullpage";

// In a chrome extension context, if this is the popup (no URL params and small viewport)
// we'll show the simplified popup view
const isPopup =
  !isFullPageView && window.innerWidth <= 600 && window.innerHeight <= 600;

// Apply specific styles for popup mode to fix height issues
if (isPopup || (!isFullPageView && chrome?.action)) {
  document.body.style.width = "600px"; // Updated width for better spacing
  document.body.style.height = "480px"; // Updated height for better spacing
  document.body.style.margin = "0";
  document.body.style.overflow = "hidden";
  document.body.classList.add("popup-mode");
  document.documentElement.style.height = "480px";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isPopup || (!isFullPageView && chrome?.action) ? (
      <ExtensionPopup />
    ) : (
      <App />
    )}
  </StrictMode>
);
