import { selectDirectory } from "../ipc";
import { globalSettings, save } from "../schedule";

export function GlobalSettings() {
	return (
		<>
			<h1>Settings</h1>
			<p>library path</p>
			<p>{globalSettings.libraryPath}</p>
			<button
				onClick={async () => {
					globalSettings.libraryPath = await selectDirectory("");
					save();
				}}
			>
				set library path
			</button>
		</>
	);
}
