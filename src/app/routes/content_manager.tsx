import { createFileRoute, Link } from "@tanstack/react-router";
import { beforeLoadAuth } from "../auth";

export const Route = createFileRoute("/content_manager")({
	component: ContentManager,
	beforeLoad: beforeLoadAuth,
});

export function ContentManager() {
	return (
		<>
			<Link to="/schedule_edit">edit schedule</Link>
			<Link to="/playlists">edit playlists</Link>
			<Link to="/bumpers">edit bumpers</Link>
			<Link to="/global_settings">edit settings</Link>
		</>
	);
}
