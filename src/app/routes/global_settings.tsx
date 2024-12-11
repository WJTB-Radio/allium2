import { createFileRoute } from "@tanstack/react-router";
import { selectDirectory } from "../ipc";
import { globalSettings, globalSettingsSignal } from "../schedule";
import { useSignal } from "../util/signal";

export const Route = createFileRoute("/global_settings")({
	component: GlobalSettings,
});

export function GlobalSettings() {
	const updateSettings = useSignal(globalSettingsSignal);
	return (
		<>
			<h1>Settings</h1>
			<p>library path</p>
			<p>{globalSettings.libraryPath}</p>
			<button
				onClick={async () => {
					globalSettings.libraryPath = await selectDirectory("");
					updateSettings();
				}}
			>
				set library path
			</button>
		</>
	);
}
