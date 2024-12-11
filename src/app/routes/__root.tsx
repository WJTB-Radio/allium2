import {
	createRootRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { debug } from "../ipc";

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	const location = useLocation();
	return (
		<>
			{location.pathname != "/" ? (
				<>
					<Link to="/">log out</Link>
					<hr />
				</>
			) : undefined}
			<Outlet />
			{debug ? <TanStackRouterDevtools /> : undefined}
		</>
	);
}
