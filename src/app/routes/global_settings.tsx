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
				<label className="entry">
					num bumpers
					<input
						type="number"
						min={0}
						max={10}
						value={globalSettings.numBumpers}
						onChange={(event) => {
							globalSettings.numBumpers =
								event.target.value == ""
									? 1
									: parseInt(event.target.value);
							updateSettings();
						}}
					/>
				</label>
				<label className="entry">
					bumper interval
					<input
						type="number"
						min={0}
						max={30}
						value={globalSettings.bumperInterval}
						onChange={(event) => {
							globalSettings.bumperInterval =
								event.target.value == ""
									? 4
									: parseInt(event.target.value);
							updateSettings();
						}}
					/>
				</label>
			</div>
		</div>
	);
}
