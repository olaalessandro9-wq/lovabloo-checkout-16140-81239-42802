import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./styles/theme-tokens.css";
import "./styles/theme-components.css";
import "./styles/layout-shell.css";
import "./styles/edit-normalize.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
