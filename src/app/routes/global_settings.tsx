import { createFileRoute } from "@tanstack/react-router";
import { selectDirectory } from "../ipc";
import { globalSettings, globalSettingsSignal, load } from "../schedule";
import { useSignal } from "../util/signal";
import { beforeLoadAuth } from "../auth";

export const Route = createFileRoute("/global_settings")({
	component: GlobalSettings,
	beforeLoad: beforeLoadAuth,
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
					await load({ settings: false, library: true });
					updateSettings();
				}}
			>
				set library path
			</button>
		</>
	);
}
