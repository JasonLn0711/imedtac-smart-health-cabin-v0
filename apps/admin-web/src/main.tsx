import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <main className="admin-shell">
      <section>
        <h1>Smart Health Cabin Admin</h1>
        <p>CMS / versioning is Sprint 2. Sprint 1 closes the PHQ-9 runtime path first.</p>
      </section>
    </main>
  </React.StrictMode>
);
