import { createFileRoute } from "@tanstack/react-router";
import { selectDirectory } from "../ipc";
import { globalSettings, globalSettingsSignal, load } from "../schedule";
import { useSignal } from "../util/signal";
import { beforeLoadAuth } from "../auth";
import { DirectoryEntry } from "../entries/directory_entry";

export const Route = createFileRoute("/global_settings")({
	component: GlobalSettings,
	beforeLoad: beforeLoadAuth,
});

export function GlobalSettings() {
	const updateSettings = useSignal(globalSettingsSignal);
	return (
		<div className="centerContainer">
			<h1>settings</h1>
			<hr />
			<div className="entries">
				<DirectoryEntry
					root={""}
					value={globalSettings.libraryPath ?? ""}
					setValue={async (value) => {
						globalSettings.libraryPath = value;
						await load({ settings: false, library: true });
						updateSettings();
					}}
				>
					library path:
				</DirectoryEntry>
			</div>
		</div>
	);
}
