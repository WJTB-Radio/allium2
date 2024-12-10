import { loadLibrary, loadSettings, saveLibrary, saveSettings } from "./ipc";
import { fallback } from "./util/error";
import { override } from "./util/override";
import { signal } from "./util/signal";

// time from start of week in ms
export function getWeekTime(): number {
	const d = new Date();
	return (
		d.getDay() * 24 * 60 * 60 * 1000 +
		d.getHours() * 60 * 60 * 1000 +
		d.getMinutes() * 60 * 1000 +
		d.getSeconds() * 1000 +
		d.getMilliseconds()
	);
}

export function getCurrentBlock(): Block | undefined {
	if (!globalSettings?.selectedSchedule) {
		return undefined;
	}
	const time = getWeekTime();
	const schedules = fallback(library?.schedules, {}, "schedules");
	const blocks = fallback(
		schedules[globalSettings.selectedSchedule]?.blocks,
		[],
		"blocks"
	);
	return blocks.find(
		(block) => time > block?.startsAt && time < block?.endsAt
	);
}

export function getShuffle(block: Block | undefined): boolean {
	const playlist = getPlaylist(block);
	return fallback(
		override(
			block?.shuffleOverride,
			playlist ? playlist.shuffle : undefined
		),
		true,
		`shuffle block id ${block?.id}`
	);
}

export function getBumperInterval(block: Block | undefined): number {
	const playlist = getPlaylist(block);
	const bumperGroup = getBumperGroup(block);
	return fallback(
		override(
			block?.bumperIntervalOverride,
			playlist?.bumperIntervalOverride,
			bumperGroup?.bumperIntervalOverride,
			globalSettings?.bumperInterval
		),
		4,
		`bumper interval block id ${block?.id}`
	);
}

export function getNumBumpers(block: Block | undefined): number {
	const playlist = getPlaylist(block);
	const bumperGroup = getBumperGroup(block);
	return fallback(
		override(
			block?.numBumpersOverride,
			playlist?.numBumpersOverride,
			bumperGroup?.numBumpersOverride,
			globalSettings?.numBumpers
		),
		1,
		`num bumpers block id ${block?.id}`
	);
}

export function getPlaylist(block: Block | undefined) {
	return block ? library.playlists[block.playlist] : undefined;
}

export function getBumperGroup(block: Block | undefined) {
	const playlist = getPlaylist(block);
	return override(
		block && block.bumperGroupOverride
			? library.bumperGroups[block.bumperGroupOverride]
			: undefined,
		playlist ? library.bumperGroups[playlist.bumperGroup] : undefined
	);
}

export let globalSettings: GlobalSettings = {
	selectedSchedule: undefined,
	libraryPath: undefined,
	numBumpers: 1,
	bumperInterval: 4,
};

export const globalSettingsSignal = signal("globalSettings");

let library: Library = {
	playlists: {},
	schedules: {},
	bumperGroups: {},
};

export async function load() {
	const s = await loadSettings();
	if (s) {
		globalSettings = s;
	}
	if (globalSettings?.libraryPath) {
		const l = await loadLibrary(globalSettings.libraryPath);
		if (l) {
			library = l;
		}
	}
}

export async function save() {
	saveSettings(globalSettings);
	if (globalSettings?.libraryPath) {
		saveLibrary(globalSettings.libraryPath, library);
	}
}

export interface Schedule {
	id: string;
	name: string;
	blocks: Block[];
}

export interface Block {
	id: string;
	// ms from start of week
	startsAt: number;
	// ms from start of week
	endsAt: number;
	playlist: string;
	shuffleOverride: boolean | undefined;
	bumperGroupOverride: string | undefined;
	numBumpersOverride: number | undefined;
	bumperIntervalOverride: number | undefined;
}

export interface Playlist {
	id: string;
	name: string;
	// relative to library path
	directory: string;
	lastPlayed: string | undefined;
	color: string;
	shuffle: boolean;
	bumperGroup: string;
	numBumpersOverride: number | undefined;
	bumperIntervalOverride: number | undefined;
}

export interface BumperGroup {
	id: string;
	name: string;
	// relative to library path
	directory: string;
	numBumpersOverride: number | undefined;
	bumperIntervalOverride: number | undefined;
}

export interface GlobalSettings {
	selectedSchedule: string | undefined;
	libraryPath: string | undefined;
	numBumpers: number;
	bumperInterval: number;
}

export interface Library {
	playlists: Record<string, Playlist>;
	schedules: Record<string, Schedule>;
	bumperGroups: Record<string, BumperGroup>;
}
