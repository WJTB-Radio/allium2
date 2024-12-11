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
					<Link to="/">log out</Link>
					<button
						onClick={() => {
							history.go(-1);
						}}
					>
						back
					</button>
					<hr />
				</>
			) : undefined}
			<Outlet />
			{debug ? <TanStackRouterDevtools /> : undefined}
		</>
	);
}
