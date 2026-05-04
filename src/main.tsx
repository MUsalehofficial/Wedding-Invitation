import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/italiana/400.css";
import "@fontsource/jura/300.css";
import "@fontsource/jura/400.css";
import "@fontsource/pinyon-script/400.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
