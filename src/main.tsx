import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./theme-bundle.css";
import "./theme-dark-hotfix.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
