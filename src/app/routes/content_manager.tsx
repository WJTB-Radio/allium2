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
			<Link to="/schedule_edit">edit schedules</Link>
			<Link to="/playlists">edit playlists</Link>
			<Link to="/bumpers">edit bumpers</Link>
			<Link to="/global_settings">edit settings</Link>
		</div>
	);
}
