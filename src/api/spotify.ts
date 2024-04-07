export function startPlaylist(uri: string) {
	if(backingOff) {
		return;
	}
	//TODO
}

export function resume() {
	if(backingOff) {
		return;
	}
	//TODO
}

export function pause() {
	if(backingOff) {
		return;
	}
	//TODO
}

export function setShuffle(shuffle: boolean) {
	if(backingOff) {
		return;
	}
	//TODO
}

export function setRepeat(repeat: boolean) {
	if(backingOff) {
		return;
	}
	//TODO
}

let backingOff = false;
const defaultBackoffTime = 4*1000;
const maxBackoffTime = 24*60*60*1000;
let backoffTime = defaultBackoffTime;
/**
 * {@link https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback}
 * */
export type PlayingInfo = {
	/** If repeat is set to off, track, or context. */
	repeat_state: 'off' | 'track' | 'context'
	/** If shuffle is on or off. */
	shuffle_state: boolean
	/** Unix Millisecond Timestamp when data was fetched. */
	timestamp: number
	/** Progress into the currently playing track or episode. */
	progress_ms: number | null
	/** The currently playing track or episode. */
	item: TrackObject | EpisodeObject | null
};

export type TrackObject = {
	/** The track length in milliseconds. */
	duration_ms: number
};

export type EpisodeObject = {
	/** The episode length in milliseconds. */
	duration_ms: number
};

export async function getPlayingInfo(): Promise<PlayingInfo> {
	if(backingOff) {
		return Promise.reject('backing off');
	}
	return fetch('', {}).then(async (response) => {
		if(response.status%100 != 2) {
			return Promise.reject(response);
		} else {
			backingOff = false;
			backoffTime = defaultBackoffTime;
		}
		return response.json();
	}).catch((error) => {
		if(typeof error.status !== 'undefined') {
			if(error.status === 421) {
				backingOff = true;
				window.setTimeout(() => {
					backingOff = false;
					backoffTime = Math.min(backoffTime*2.0, maxBackoffTime);
				}, backoffTime);
			} else if(error.status === 401) {
				reauthenticate();
			}
		}
		return Promise.reject(error);
	});
}

function reauthenticate() {
	if(backingOff) {
		return;
	}
	//TODO
}
