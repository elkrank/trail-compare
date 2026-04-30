import React from "react";
import { createRoot } from "react-dom/client";
import TrailMatchMvp from "../trailmatch_mvp_react.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TrailMatchMvp />
  </React.StrictMode>
);
