// ==UserScript==
// @name         Tuna browser script
// @namespace    univrsal
// @version      1.0.21
// @description  Get song information from web players, based on NowSniper by Kıraç Armağan Önal
// @author       univrsal
// @match        *://open.spotify.com/*
// @match        *://soundcloud.com/*
// @match        *://music.yandex.com/*
// @match        *://music.yandex.ru/*
// @match        *://www.deezer.com/*
// @match        *://play.pretzel.rocks/*
// @match        *://*.youtube.com/*
// @match        *://app.plex.tv/*
// @grant        unsafeWindow
// @license      GPLv2
// ==/UserScript==

import { songInfo } from "./main";

export interface TunaState {
	cover?: string;
	title?: string;
	artists?: string[];
	artist?: string;
	status?: "playing" | "stopped";
	progress?: number;
	duration?: number;
	album_url?: string;
	album?: string;
}

export function startTuna() {
	"use strict";
	console.log("Loading tuna browser script");

	// Configuration
	var port = 1608;
	var refresh_rate_ms = 500;
	var cooldown_ms = 10000;

	// Tuna isn't running we sleep, because every failed request will log into the console
	// so we don't want to spam it
	var failure_count = 0;
	var cooldown = 0;
	var last_state: TunaState = {};

	function post(data: TunaState) {
		if (data.status) {
			/* if this tab isn't playing and the status hasn't changed we don't send an update
			 * otherwise tabs that are paused would constantly send the paused/stopped state
			 * which interferes another tab that is playing something
			 */
			if (
				data.status !== "playing" &&
				last_state.status === data.status
			) {
				return; // Prevent the paused state from being continously sent, since this tab is not playing, should prevent tabs from clashing with eachother
			}
		}
		last_state = data;
		var url = "http://localhost:" + port + "/";
		fetch(url, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				"Access-Control-Allow-Headers": "*",
				"Access-Control-Allow-Origin": "*",
			},
			body: JSON.stringify({
				data,
				hostname: "allium2",
				date: Date.now(),
			}),
		})
			.then((response) => {
				if (response.status !== 200) {
					failure_count++;
				}
			})
			.catch(() => {
				failure_count++;
			});
	}

	function StartFunction() {
		setInterval(() => {
			if (failure_count > 3) {
				console.log(
					"Failed to connect multiple times, waiting a few seconds",
				);
				cooldown = cooldown_ms;
				failure_count = 0;
			}

			if (cooldown > 0) {
				cooldown -= refresh_rate_ms;
				return;
			}
			const status = !!songInfo.title ? "playing" : "stopped";
			const title = songInfo.title;
			const artists = songInfo.artist ? [songInfo.artist] : undefined;
			const progress = songInfo.time; // ms
			const duration = songInfo.duration; // ms
			const album = songInfo.album;
			post({
				cover: "http://127.0.0.1:1609/cover",
				title,
				artists,
				status,
				progress,
				duration,
				album,
			});
		}, refresh_rate_ms);
	}
	StartFunction();
}
