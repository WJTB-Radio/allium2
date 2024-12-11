import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/schedule_edit")({
	component: ScheduleEdit,
});

export function ScheduleEdit() {
	return <div></div>;
}
