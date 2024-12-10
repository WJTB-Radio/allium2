import "./index.css";
import { createRoot } from "react-dom/client";
import { App } from "./app/app";
import { createElement } from "react";

console.log("running renderer");

const app = document.getElementById("app");
if (app) {
	const root = createRoot(app);
	root.render(createElement(App));
} else {
	console.error("no app div found in dom");
}
