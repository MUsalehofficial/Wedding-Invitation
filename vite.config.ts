import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/** GitHub Pages project sites are served at /<repo-name>/; CI sets GITHUB_REPOSITORY. */
function pagesBase(): string {
  const r = process.env.GITHUB_REPOSITORY;
  if (!r?.includes("/")) return "/";
  return `/${r.split("/")[1]}/`;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: pagesBase(),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
