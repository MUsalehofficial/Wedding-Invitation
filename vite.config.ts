import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/** GitHub Pages project sites are served at /<repo-name>/; CI sets GITHUB_REPOSITORY. */
function pagesBase(): string {
  const r = process.env.GITHUB_REPOSITORY;
  if (!r?.includes("/")) return "/";
  return `/${r.split("/")[1]}/`;
}

/** RSVP proxy path aligned with dev `base` (see vite `base` below). */
function rsvpProxyKey(basePath: string): string {
  return basePath === "/" ? "/__rsvp_proxy" : `${basePath.replace(/\/$/, "")}/__rsvp_proxy`;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rsvpScriptUrl = env.VITE_RSVP_SCRIPT_URL?.trim();

  // Local dev: always serve from `/` so http://localhost:8080/ works. Production build still uses GH Pages base.
  const base = command === "serve" ? "/" : pagesBase();

  const devProxy: Record<string, { target: string; changeOrigin: boolean; rewrite: () => string }> =
    {};
  if (command === "serve" && rsvpScriptUrl) {
    try {
      const u = new URL(rsvpScriptUrl);
      if (u.hostname === "script.google.com") {
        const pathname = u.pathname;
        devProxy[rsvpProxyKey(base)] = {
          target: `${u.protocol}//${u.host}`,
          changeOrigin: true,
          rewrite: () => pathname,
        };
      }
    } catch {
      /* invalid URL */
    }
  }

  return {
    base,
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: devProxy,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
    },
  };
});
