import { electronAPI } from "../preload";
import { GlobalSettings, Library } from "./schedule";
import { joinPaths } from "./util/path";

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
	return (await getElectronAPI().findSongs(directory))
		.sort()
		.map((file) => joinPaths(directory, encodeURI(file)));
}

export async function loadSettings(): Promise<GlobalSettings | undefined> {
	const s = await getElectronAPI().loadSettings();
	return s == "" ? undefined : JSON.parse(s);
}

export async function saveSettings(settings: GlobalSettings): Promise<void> {
	return getElectronAPI().saveSettings(JSON.stringify(settings));
}

export async function loadLibrary(path: string): Promise<Library | undefined> {
	const s = await getElectronAPI().loadLibrary(path);
	return s == "" ? undefined : JSON.parse(s);
}

export async function saveLibrary(
	path: string,
	library: Library,
): Promise<string> {
	return getElectronAPI().saveLibrary(path, JSON.stringify(library));
}

export let debug = false;
export let platform: NodeJS.Platform;
export async function getInfo() {
	debug = await getElectronAPI().getDebug();
	platform = await getElectronAPI().getPlatform();
}

export async function updateNowPlaying(playing: {
	file?: string;
	time?: number;
	duration?: number;
}) {
	await getElectronAPI().updatePlaying(playing);
}
