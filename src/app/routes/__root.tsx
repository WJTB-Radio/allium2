import {
	createRootRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

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
			<TanStackRouterDevtools />
		</>
	);
}
