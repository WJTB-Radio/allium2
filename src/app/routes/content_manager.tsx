import { createFileRoute, Link } from "@tanstack/react-router";
import { beforeLoadAuth } from "../auth";
import { getSchedule, globalSettingsSignal, library } from "../schedule";
import { useSignal } from "../util/signal";
import { ScheduleSelect } from "../entries/select";

export const Route = createFileRoute("/content_manager")({
	component: ContentManager,
	beforeLoad: beforeLoadAuth,
});

export function ContentManager() {
	const updateSettings = useSignal(globalSettingsSignal);
	return (
		<div className="centerContainer">
			<h1>content management</h1>
			<hr />
			{Object.keys(library.schedules).length > 0 ? (
				<ScheduleSelect
					defaultValue={getSchedule()?.id}
					onChange={(schedule) => {
						library.selectedSchedule = schedule;
						updateSettings();
					}}
				>
					select active schedule
				</ScheduleSelect>
			) : (
				<p>
					there are no schedules in the library. please create a
					schedule.
				</p>
			)}
			<hr />
			<Link to="/schedule_edit">schedule editor</Link>
			<Link to="/playlists">playlist editor</Link>
			<Link to="/bumpers">bumper editor</Link>
			<Link to="/global_settings">settings editor</Link>
		</div>
	);
}
