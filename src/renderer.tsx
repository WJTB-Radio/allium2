import "./index.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import {
	RouterProvider,
	createHashHistory,
	createRouter,
} from "@tanstack/react-router";
import { routeTree } from "./app/route_tree.gen";
import { RecoilRoot } from "recoil";
import { Schedule } from "./app/schedule";
import Automation from "./app/automation";
import { getInfo } from "./app/ipc";

// Create a new router instance
const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

getInfo().then(() => {
	// Render the app
	const rootElement = document.getElementById("app")!;
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<RecoilRoot>
				<Schedule />
				<Automation />
				<RouterProvider router={router} />
			</RecoilRoot>
		</StrictMode>,
	);
});
