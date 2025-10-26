import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./theme.css";
import "./theme-dark-text-hotfix.css";
import "./theme-dark-text-hotfix-extended.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
