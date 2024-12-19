import { useEffect } from "react";
import { loadLibrary, loadSettings, saveLibrary, saveSettings } from "./ipc";
import { fallback } from "./util/error";
import { signal, useSignal } from "./util/signal";

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
	if (!library.selectedSchedule) {
		return undefined;
	}
	const time = getWeekTime();
	const schedules = getSchedules();
	const blocks = fallback(
		schedules[library.selectedSchedule]?.blocks,
		[],
		"blocks",
	);
	return blocks.find(
		(block) => time > block?.startsAt && time < block?.endsAt,
	);
}

export function getSchedules(): Record<string, Schedule> {
	const schedules = library?.schedules;
	return fallback(schedules, {}, "schedules");
}

export function getSchedule(): Schedule | undefined {
	const schedules = getSchedules();
	if (!library.selectedSchedule) return undefined;
	return schedules[library.selectedSchedule];
}

export function getShuffle(block: Block | undefined): boolean {
	const playlist = getPlaylist(block);
	return fallback(
		block?.shuffleOverride ?? playlist?.shuffle,
		true,
		`shuffle block id ${block}`,
	);
}

export function getBumperInterval(block: Block | undefined): number {
	const playlist = getPlaylist(block);
	const bumperGroup = getBumperGroup(block);
	return fallback(
		block?.bumperIntervalOverride ??
			playlist?.bumperIntervalOverride ??
			bumperGroup?.bumperIntervalOverride ??
			globalSettings?.bumperInterval,
		4,
		`bumper interval block id ${block}`,
	);
}

export function getNumBumpers(block: Block | undefined): number {
	const playlist = getPlaylist(block);
	const bumperGroup = getBumperGroup(block);
	return fallback(
		block?.numBumpersOverride ??
			playlist?.numBumpersOverride ??
			bumperGroup?.numBumpersOverride ??
			globalSettings?.numBumpers,
		1,
		`num bumpers block id ${block}`,
	);
}

export function getDefaultPlaylist(): string {
	const playlistIds = Object.keys(library.playlists);
	if (playlistIds.length == 0) {
		console.error("no playlists");
		return "";
	}
	return playlistIds[0];
}

export function getPlaylist(block: Block | undefined) {
	return block ? library.playlists[block.playlist] : undefined;
}

export function getBumperGroup(block: Block | undefined) {
	const playlist = getPlaylist(block);
	return (
		(block && block.bumperGroupOverride
			? library.bumperGroups[block.bumperGroupOverride]
			: undefined) ??
		(playlist ? library.bumperGroups[playlist.bumperGroup] : undefined)
	);
}

export let globalSettings: GlobalSettings = {
	libraryPath: undefined,
	numBumpers: 1,
	bumperInterval: 4,
};

export const globalSettingsSignal = signal("globalSettings");

export let library: Library = {
	selectedSchedule: undefined,
	playlists: {},
	schedules: {},
	bumperGroups: {},
};

export let loaded = false;
export async function load(what?: { library: boolean; settings: boolean }) {
	if (what?.settings ?? true) {
		const s = await loadSettings();
		if (s) {
			globalSettings = s;
		}
	}
	if ((what?.library ?? true) && globalSettings?.libraryPath) {
		const l = await loadLibrary(globalSettings.libraryPath);
		if (l) {
			library = l;
		}
	}
	loaded = true;
}

let saveTimeout: undefined | number = undefined;
async function save() {
	if (!loaded) return;
	if (saveTimeout != undefined) {
		clearTimeout(saveTimeout);
		saveTimeout = undefined;
	}
	saveTimeout = window.setTimeout(async () => {
		saveTimeout = undefined;
		await saveSettings(globalSettings);
		if (globalSettings?.libraryPath) {
			await saveLibrary(globalSettings.libraryPath, library);
		}
	}, 5000);
}

export function Schedule() {
	const updateSettings = useSignal(globalSettingsSignal);
	useEffect(() => {
		load().then(updateSettings);
	}, []); // updateSettings in the dep array here would cause an infinite loop
	useEffect(() => {
		save();
	}, [updateSettings]);
	return <></>;
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
	libraryPath: string | undefined;
	numBumpers: number;
	bumperInterval: number;
}

export interface Library {
	selectedSchedule: string | undefined;
	playlists: Record<string, Playlist>;
	schedules: Record<string, Schedule>;
	bumperGroups: Record<string, BumperGroup>;
}
