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

/** Same-origin path the dev server proxies to Google Apps Script (avoids browser CORS from localhost). */
function rsvpDevProxyPath(): string {
  const base = pagesBase();
  return base === "/" ? "/__rsvp_proxy" : `${base.replace(/\/$/, "")}/__rsvp_proxy`;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rsvpScriptUrl = env.VITE_RSVP_SCRIPT_URL?.trim();

  const devProxy: Record<string, { target: string; changeOrigin: boolean; rewrite: () => string }> =
    {};
  if (rsvpScriptUrl) {
    try {
      const u = new URL(rsvpScriptUrl);
      if (u.hostname === "script.google.com") {
        const pathname = u.pathname;
        devProxy[rsvpDevProxyPath()] = {
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
    base: pagesBase(),
    server: {
      host: "::",
      port: 8080,
      /** Fail fast if 8080 is taken — no silent bump to 8081, 8084, etc. */
      strictPort: true,
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
