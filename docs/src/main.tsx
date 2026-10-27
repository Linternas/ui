import { createRoot } from "react-dom/client";
import Root from "./Root";
import "../../system.css";
import "../../styles.css";
import "./site.css";

createRoot(document.getElementById("root")!).render(<Root />);
