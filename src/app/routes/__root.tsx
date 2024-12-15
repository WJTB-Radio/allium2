import {
	createRootRoute,
	Link,
	Outlet,
	useLocation,
	useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { debug } from "../ipc";

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	const location = useLocation();
	const { history } = useRouter();
	return (
		<>
			{location.pathname != "/" ? (
				<>
					<nav>
						<button
							onClick={() => {
								history.go(-1);
							}}
						>
							back
						</button>
						<Link to="/">log out</Link>
					</nav>
					<hr />
				</>
			) : undefined}
			<Outlet />
			{debug ? <TanStackRouterDevtools /> : undefined}
		</>
	);
}
