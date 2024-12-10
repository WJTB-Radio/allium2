import { Howl } from "howler";
import {
	getBumperGroup,
	getBumperInterval,
	getCurrentBlock,
	getPlaylist,
	getShuffle,
	globalSettings,
	globalSettingsSignal,
	loaded,
} from "./schedule";
import { getSongsInDirectory } from "./ipc";
import { baseName, joinPaths } from "./util/path";
import { shuffle } from "./util/shuffle";
import { useEffect, useMemo } from "react";
import { signal, useSignal } from "./util/signal";
import { atom, SetterOrUpdater, useRecoilState } from "recoil";

// in ms
const crossfadeDuration = 1000;

const recentlyPlayedBumpers: string[] = [];
const recentlyPlayedSongs: string[] = [];

let currentAudio: Howl | undefined;
let nextAudio: Howl | undefined;

let songsPlayed = 0;
let crossfadeTimeout: number | undefined;
async function getNextAudio(): Promise<Howl | undefined> {
	if (!loaded) {
		if (updatePlaying) updatePlaying("");
		return undefined;
	}
	if (!globalSettings.libraryPath) {
		console.error("no library path", globalSettings);
		if (updatePlaying) updatePlaying("");
		return undefined;
	}
	const block = getCurrentBlock();
	let selectedFile: string | undefined;
	const bumperInterval = getBumperInterval(block);
	if (bumperInterval == 0 || songsPlayed <= bumperInterval) {
		songsPlayed++;
		// play a song
		const playlist = getPlaylist(block);
		if (!playlist) {
			console.error("missing playlist");
			if (updatePlaying) updatePlaying("");
			return;
		}
		const songs = await getSongsInDirectory(
			joinPaths(globalSettings.libraryPath, playlist.directory)
		);
		if (getShuffle(block)) {
			selectedFile = shuffle(songs, recentlyPlayedSongs);
		} else {
			const selectedIdx =
				(songs.findIndex((song) => playlist.lastPlayed == song) + 1) %
				songs.length;
			selectedFile = songs[selectedIdx];
		}
		playlist.lastPlayed = selectedFile;
	} else {
		songsPlayed = 0;
		// play a bumper
		const bumperGroup = getBumperGroup(block);
		if (!bumperGroup) {
			console.error("missing bumper group");
			if (updatePlaying) updatePlaying("");
			return;
		}
		const bumpers = await getSongsInDirectory(
			joinPaths(globalSettings.libraryPath, bumperGroup.directory)
		);
		selectedFile = shuffle(bumpers, recentlyPlayedBumpers);
	}

	if (selectedFile) {
		const howl = new Howl({ src: [`file://${selectedFile}`] });
		howl.on("fade", () => {
			if (howl.volume() == 0) {
				howl.stop();
				if (updatePlaying) updatePlaying("");
			}
		});
		if (updatePlaying) {
			updatePlaying(decodeURIComponent(baseName(selectedFile) ?? ""));
		}
		return howl;
	} else {
		if (updatePlaying) updatePlaying("");
		return undefined;
	}
}

async function howlEvent(audio: Howl, event: string) {
	return new Promise((resolve, _reject) => {
		audio.on(event, resolve);
	});
}

async function playNext(fadeTime?: number) {
	if (!fadeTime) fadeTime = crossfadeDuration;
	if (!nextAudio) nextAudio = await getNextAudio();
	if (!nextAudio) {
		return;
	}
	if (nextAudio.duration() == 0) {
		await howlEvent(nextAudio, "load");
	}
	nextAudio.fade(0.0, 1.0, fadeTime);
	nextAudio.play();
	if (currentAudio) {
		currentAudio.fade(currentAudio.volume(), 0.0, fadeTime);
	}
	crossfadeTimeout = window.setTimeout(async () => {
		await playNext();
	}, nextAudio.duration() * 1000 - nextAudio.seek() * 1000 - crossfadeDuration);
	currentAudio = nextAudio;
	// preload next audio so its ready when we want it
	nextAudio = await getNextAudio();
}

export function isPlaying() {
	return currentAudio?.playing() ?? false;
}

let started = false;
async function start() {
	if (!loaded) return;
	if (!started) {
		started = true;
		await playNext();
	}
}

export function fadeOut(fadeTime: number) {
	if (crossfadeTimeout != undefined) {
		window.clearTimeout(crossfadeTimeout);
	}
	crossfadeTimeout = undefined;
	if (currentAudio) {
		currentAudio.fade(currentAudio.volume(), 0.0, fadeTime);
		currentAudio.on("fade", () => {
			started = false;
		});
		currentAudio = undefined;
	}
}

export function fadeIn(fadeTime: number) {
	if (currentAudio && currentAudio.playing()) return;
	playNext(fadeTime);
}

export const playingAtom = atom({ key: "playing", default: "" });
let updatePlaying: SetterOrUpdater<string> | undefined;

export default function Automation() {
	const updateSettings = useSignal(globalSettingsSignal);
	useEffect(() => {
		start();
	}, [updateSettings]);
	return useMemo(() => <Playing />, []);
}

function Playing() {
	const [playing, setPlaying] = useRecoilState(playingAtom);
	updatePlaying = setPlaying;
	return <></>;
}
