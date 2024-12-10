import { Howl } from "howler";
import {
	getBumperGroup,
	getBumperInterval,
	getCurrentBlock,
	getPlaylist,
	getShuffle,
	globalSettings,
} from "./schedule";
import { getSongsInDirectory } from "./ipc";
import { joinPaths } from "./util/path";
import { shuffle } from "./util/shuffle";
import { useEffect } from "react";

// in ms
const crossfadeDuration = 1000;

const recentlyPlayedBumpers: string[] = [];
const recentlyPlayedSongs: string[] = [];

let song: Howl | undefined;

let songsPlayed = 0;
let crossfadeTimeout: number | undefined;
async function next() {
	if (!globalSettings.libraryPath) {
		return;
	}
	const block = getCurrentBlock();
	let selectedFile: string | undefined;
	if (songsPlayed >= getBumperInterval(block)) {
		songsPlayed++;
		// play a song
		const playlist = getPlaylist(block);
		if (!playlist) {
			console.error("missing playlist");
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
		// play a bumper
		const bumperGroup = getBumperGroup(block);
		if (!bumperGroup) {
			console.error("missing bumper group");
			return;
		}
		const bumpers = await getSongsInDirectory(
			joinPaths(globalSettings.libraryPath, bumperGroup.directory)
		);
		selectedFile = shuffle(bumpers, recentlyPlayedBumpers);
	}
	if (song) {
		song.fade(song.volume(), 0.0, crossfadeDuration);
	}
	if (selectedFile) {
		song = new Howl({ src: [`file://${selectedFile}`] });
		song.fade(0.0, 1.0, crossfadeDuration).play();
		crossfadeTimeout = window.setTimeout(() => {
			next();
		}, song.duration() * 1000 - crossfadeDuration);
	} else {
		next();
	}
}

export function fadeOut(fadeTime: number) {
	if (crossfadeTimeout != undefined) {
		window.clearTimeout(crossfadeTimeout);
	}
	crossfadeTimeout = undefined;
	if (song) {
		song.fade(song.volume(), 0.0, fadeTime);
		song = undefined;
	}
}

export default function Automation() {
	useEffect(() => {
		next();
	}, []);
	return <></>;
}
