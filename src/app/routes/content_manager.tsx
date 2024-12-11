import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/content_manager")({
	component: ContentManager,
});

export function ContentManager() {
	return (
		<>
			<p>ContentManager</p>
		</>
	);
}
