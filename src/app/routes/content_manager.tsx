import { createFileRoute, Link } from "@tanstack/react-router";
import { beforeLoadAuth } from "../auth";
import { getSchedule, globalSettingsSignal, library } from "../schedule";
import { useSignal } from "../util/signal";

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
				<label>
					select active schedule
					<select
						value={
							getSchedule()?.id ??
							Object.keys(library.schedules)[0] ??
							""
						}
						onChange={(event) => {
							library.selectedSchedule = event.target.value;
							updateSettings();
						}}
					>
						{Object.entries(library.schedules).map(
							([id, schedule]) => (
								<option key={id} value={id}>
									{schedule.name}
								</option>
							),
						)}
					</select>
				</label>
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
