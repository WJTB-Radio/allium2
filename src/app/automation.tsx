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
import { useSignal } from "./util/signal";
import { atom, SetterOrUpdater, useRecoilState } from "recoil";
import { clearAllTimeouts } from "./util/timeout";

// in ms
const crossfadeDuration = 300;

const recentlyPlayedBumpers: string[] = [];
const recentlyPlayedSongs: string[] = [];

interface AudioDescription {
	audio: Howl | undefined;
	name: string;
}

let currentAudio: AudioDescription = { audio: undefined, name: "" };
let nextAudio: AudioDescription = { audio: undefined, name: "" };

let songsPlayed = 0;
let crossfadeTimeout: number | undefined;
async function getNextAudio(): Promise<AudioDescription> {
	if (!loaded) {
		return { audio: undefined, name: "" };
	}
	if (!globalSettings.libraryPath) {
		console.error("no library path", globalSettings);
		return { audio: undefined, name: "" };
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
			return { audio: undefined, name: "" };
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
			return { audio: undefined, name: "" };
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
			}
		});
		return {
			audio: howl,
			name: decodeURIComponent(baseName(selectedFile) ?? ""),
		};
	} else {
		return { audio: undefined, name: "" };
	}
}

async function howlEvent(audio: Howl, event: string) {
	return new Promise((resolve, _reject) => {
		audio.on(event, resolve);
	});
}

async function playNext(fadeTime?: number) {
	if (crossfadeTimeout != undefined) {
		window.clearTimeout(crossfadeTimeout);
		crossfadeTimeout = undefined;
	}
	if (!fadeTime) fadeTime = crossfadeDuration;
	if (!nextAudio.audio) nextAudio = await getNextAudio();
	if (!nextAudio.audio) {
		return;
	}
	if (nextAudio.audio.duration() == 0) {
		await howlEvent(nextAudio.audio, "load");
		// nextAudio might have changed since we started loading
		if (!nextAudio.audio) return;
	}
	nextAudio.audio.fade(0.0, 1.0, fadeTime);
	nextAudio.audio.play();
	if (updatePlaying) updatePlaying(nextAudio.name);
	if (currentAudio.audio) {
		currentAudio.audio.fade(currentAudio.audio.volume(), 0.0, fadeTime);
	}
	crossfadeTimeout = window.setTimeout(async () => {
		await playNext();
	}, nextAudio.audio.duration() * 1000 - nextAudio.audio.seek() * 1000 - crossfadeDuration);
	currentAudio = nextAudio;
	// preload next audio so its ready when we want it
	nextAudio = await getNextAudio();
}

export function isPlaying() {
	return currentAudio.audio?.playing() ?? false;
}

let started = false;
async function start() {
	if (!loaded) return;
	if (!started) {
		// reset state for case of hot-reload
		clearAllTimeouts();
		started = true;
		await playNext();
	}
}

export function fadeOut(fadeTime: number) {
	if (crossfadeTimeout != undefined) {
		window.clearTimeout(crossfadeTimeout);
		crossfadeTimeout = undefined;
	}
	if (currentAudio.audio) {
		if (updatePlaying) updatePlaying("");
		currentAudio.audio.fade(currentAudio.audio.volume(), 0.0, fadeTime);
		currentAudio.audio = undefined;
	}
}

export function fadeIn(fadeTime: number) {
	if (currentAudio.audio && currentAudio.audio.playing()) return;
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
