import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config
export default defineConfig({
	plugins: [
		TanStackRouterVite({
			routesDirectory: "src/app/routes",
			generatedRouteTree: "src/app/route_tree.gen.ts",
			quoteStyle: "double",
		}),
		viteReact(),
	],
});
