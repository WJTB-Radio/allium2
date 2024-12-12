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
import { formatSongTime } from "./util/format";

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
	if (bumperInterval == 0 || songsPlayed < bumperInterval) {
		songsPlayed++;
		// play a song
		const playlist = getPlaylist(block);
		if (!playlist) {
			console.error("missing playlist");
			return { audio: undefined, name: "" };
		}
		const songs = await getSongsInDirectory(
			joinPaths(globalSettings.libraryPath, playlist.directory),
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
			joinPaths(globalSettings.libraryPath, bumperGroup.directory),
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
		howl.on("loaderror", async () => {
			nextAudio = await getNextAudio();
		});
		howl.on("playerror", async () => {
			await playNext();
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
	if (currentAudio.audio) {
		currentAudio.audio.fade(
			currentAudio.audio.volume(),
			0.0,
			fadeOnSongEnd ?? fadeTime,
		);
		if (fadeOnSongEnd != undefined) {
			fadeOnSongEnd = undefined;
			changePlaying({ audio: undefined, name: "" });
			return;
		}
	}
	if (fadeOnSongEnd != undefined) return;
	if (!nextAudio.audio) nextAudio = await getNextAudio();
	if (!nextAudio.audio) {
		changePlaying(nextAudio);
		return;
	}
	if (nextAudio.audio.duration() == 0) {
		await howlEvent(nextAudio.audio, "load");
		// nextAudio might have changed since we started loading
		if (!nextAudio.audio) return;
	}
	nextAudio.audio.fade(0.0, 1.0, fadeTime);
	nextAudio.audio.play();
	changePlaying(nextAudio);
	playNextAfterFade(nextAudio, crossfadeDuration);
	currentAudio = nextAudio;
	// preload next audio so its ready when we want it
	nextAudio = await getNextAudio();
}

function playNextAfterFade(audio: AudioDescription, fade: number) {
	if (crossfadeTimeout != undefined) {
		window.clearTimeout(crossfadeTimeout);
		crossfadeTimeout = undefined;
	}
	if (!audio.audio) return;
	crossfadeTimeout = window.setTimeout(
		playNext,
		audio.audio.duration() * 1000 - audio.audio.seek() * 1000 - fade,
	);
}

function changePlaying(audio: AudioDescription) {
	if (updatePlaying) updatePlaying(audio.name);
	if (updateDuration) {
		const duration = audio.audio?.duration();
		updateDuration(duration == undefined ? "" : formatSongTime(duration));
	}
	changeTime(audio);
}

function changeTime(audio?: AudioDescription) {
	if (!audio) audio = currentAudio;
	if (!updateTime) return;
	if (audio.audio) {
		const time = audio.audio.seek();
		updateTime(formatSongTime(time));
	} else {
		updateTime("");
	}
}

let started = false;
async function start() {
	if (!loaded) return;
	if (!started) {
		// reset state for case of hot-reload
		clearAllTimeouts();
		setInterval(changeTime, 100);
		started = true;
		await playNext();
	}
}

export let fadeOnSongEnd: undefined | number = undefined;
export function fadeOutOnSongEnd(fadeTime: number) {
	fadeOnSongEnd = fadeTime;
	if (!currentAudio.audio) return;
	playNextAfterFade(currentAudio, fadeOnSongEnd);
}

export function cancelFadeOnSongEnd() {
	fadeOnSongEnd = undefined;
	playNextAfterFade(currentAudio, crossfadeDuration);
}

export function fadeOut(fadeTime: number) {
	if (crossfadeTimeout != undefined) {
		window.clearTimeout(crossfadeTimeout);
		crossfadeTimeout = undefined;
	}
	if (currentAudio.audio) {
		currentAudio.audio.fade(currentAudio.audio.volume(), 0.0, fadeTime);
		currentAudio.audio = undefined;
		currentAudio.name = "";
		changePlaying(currentAudio);
	}
}

export function fadeIn(fadeTime: number) {
	cancelFadeOnSongEnd();
	if (currentAudio.audio && currentAudio.audio.playing()) return;
	playNext(fadeTime);
}

export function getNext() {
	return nextAudio;
}

export async function skipNext() {
	nextAudio = await getNextAudio();
}

export default function Automation() {
	const updateSettings = useSignal(globalSettingsSignal);
	useEffect(() => {
		start();
	}, [updateSettings]);
	return useMemo(() => <Playing />, []);
}

export const playingAtom = atom({ key: "playing", default: "" });
let updatePlaying: SetterOrUpdater<string> | undefined;
export const timeAtom = atom({ key: "time", default: "" });
let updateTime: SetterOrUpdater<string> | undefined;
export const durationAtom = atom({ key: "duration", default: "" });
let updateDuration: SetterOrUpdater<string> | undefined;
function Playing() {
	const [_playing, setPlaying] = useRecoilState(playingAtom);
	updatePlaying = setPlaying;
	const [_time, setTime] = useRecoilState(timeAtom);
	updateTime = setTime;
	const [_duration, setDuration] = useRecoilState(durationAtom);
	updateDuration = setDuration;
	return <></>;
}
