import { createFileRoute } from "@tanstack/react-router";
import { beforeLoadAuth } from "../auth";

export const Route = createFileRoute("/schedule_edit")({
	component: ScheduleEdit,
	beforeLoad: beforeLoadAuth,
});

export function ScheduleEdit() {
	return <div></div>;
}
