import { selectDirectory } from "../ipc";
import { globalSettings, globalSettingsSignal } from "../schedule";
import { useSignal } from "../util/signal";

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
