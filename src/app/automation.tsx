import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { Block, getCurrentBlock } from './schedule';
import { getPlayingInfo, setRepeat, setShuffle, startPlaylist, pause, resume } from '../api/spotify';
import { ipcMain, ipcRenderer } from 'electron';

export const automationEnabledState = atom({
	key: 'automationEnabled',
	default: true,
});

let currentBlock: Block | undefined;
let isOverrunning: boolean = false;
function startBlock(block: Block) {
	isOverrunning = false;
	startPlaylist(block.spotifyURI);
	setShuffle(block.shuffle);
	setRepeat(false);
	currentBlock = block;
}

let songEnd: number | 'none' | 'fetching' = 'none';
let currentLatency: number = 0;
// runs every 0.25 seconds while automation is enabled
function tick() {
	if(playingBumpers) {
		return;
	}
	let newBlock = getCurrentBlock();
	if(currentBlock == undefined) {
		startBlock(newBlock);
		return;
	}
	if(newBlock.id !== currentBlock.id) {
		if(currentBlock.overrun) {
			isOverrunning = true;
		} else {
			startBlock(newBlock);
			return;
		}
	}
	if(songEnd === 'none') {
		songEnd = 'fetching';
		const fetchTime = Date.now();
		getPlayingInfo().then((data) => {
			if(data.item == null) {
				songEnd = 'none';
				return;
			}
			songEnd = data.item.duration_ms - data.progress_ms;
			// assume rtt doesnt change signifigantly
			currentLatency = data.timestamp - fetchTime;
			songEnd -= currentLatency;
		}, (_error) => {
			songEnd = 'none';
		});
	} else if(typeof songEnd === 'number') {
		if(Date.now() >= songEnd) {
			onSongEnd();
			songEnd = 'none';
		}
	}
}

let songCount = 0;
let playingBumpers = false;
function onSongEnd() {
	songCount += 1;
	if(songCount >= currentBlock.bumperInterval) {
		songCount = 0;
		playingBumpers = true;
		pause();
		ipcRenderer.send('playBumpers', currentBlock.numBumpers, currentBlock.bumperPath);
		ipcRenderer.once('donePlayingBumpers', () => {
			resume();
			playingBumpers = false;
		});
	}
}

export default function Automation() {
	const [automationEnabled, setAutomationEnabled] = useRecoilState(automationEnabledState);
	useEffect(() => {
		if(!automationEnabled) {
			return;
		}
		const t = window.setInterval(tick, 250);
		return () => {
			window.clearInterval(t);
		};
	}, [automationEnabled]);
	return <></>;
}
