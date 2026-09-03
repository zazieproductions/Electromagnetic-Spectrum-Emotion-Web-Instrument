import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Relative base keeps the built bundle portable on GitHub Pages
// (https://<org>.github.io/<repo>/) as well as local preview servers.
// The allowed-hosts block permits the platform's *.e2b.app live preview proxy.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app", "localhost", "127.0.0.1"],
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app", "localhost", "127.0.0.1"],
  },
});
