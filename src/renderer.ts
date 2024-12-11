import "./index.css";
import { createRoot } from "react-dom/client";
import { App } from "./app/app";
import { createElement } from "react";
import { initPath } from "./app/util/path";

initPath().then(() => {
	const root = createRoot(document.body);
	root.render(createElement(App));
});
