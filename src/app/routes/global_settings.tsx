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
		<div className="centerContainer">
			<h1>settings</h1>
			<hr />
			<div className="entries">
				<div className="entry">
					library path: {globalSettings.libraryPath}
					<button
						onClick={async () => {
							const selected = await selectDirectory("");
							if (selected == undefined) return;
							globalSettings.libraryPath = selected;
							await load({ settings: false, library: true });
							updateSettings();
						}}
					>
						set library path
					</button>
				</div>
			</div>
		</div>
	);
}
