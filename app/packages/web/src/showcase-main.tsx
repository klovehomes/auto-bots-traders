import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ShowcaseApp } from "./showcase.js";
import "./styles.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("missing #root element");

createRoot(rootEl).render(
  <StrictMode>
    <ShowcaseApp />
  </StrictMode>,
);
