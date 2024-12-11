import { electronAPI } from "../preload";
import { GlobalSettings, Library } from "./schedule";
import { baseName, joinPaths } from "./util/path";

export function getElectronAPI() {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (window as any).electronAPI as electronAPI;
}

export async function selectDirectory(
	startDirectory: string,
): Promise<string | undefined> {
	return getElectronAPI().openDirectory(startDirectory);
}

export async function getSongsInDirectory(
	directory: string,
): Promise<string[]> {
	return (await getElectronAPI().findSongs(directory)).sort().map((file) =>
		joinPaths(directory, encodeURIComponent(file))
	);
}

export async function loadSettings(): Promise<GlobalSettings | undefined> {
	const s = await getElectronAPI().loadSettings();
	return s == "" ? undefined : JSON.parse(s);
}

export async function saveSettings(settings: GlobalSettings): Promise<void> {
	return getElectronAPI().saveSettings(
		JSON.stringify(settings),
	);
}

export async function loadLibrary(path: string): Promise<Library | undefined> {
	const s = await getElectronAPI().loadLibrary(path);
	return s == "" ? undefined : JSON.parse(s);
}

export async function saveLibrary(
	path: string,
	library: Library,
): Promise<string> {
	return getElectronAPI().saveLibrary(
		path,
		JSON.stringify(library),
	);
}
