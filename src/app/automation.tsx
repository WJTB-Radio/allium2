import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { Block, getCurrentBlock } from './schedule';
import { getPlayingInfo, setRepeat, setShuffle, startPlaylist } from '../api/spotify';

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
// runs every 0.25 seconds while automation is enabled
function tick() {
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
		getPlayingInfo().then((data) => {
			console.log(`success: ${data}`);
		}, (_error) => {
			songEnd = 'none';
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
