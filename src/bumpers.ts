import { IpcMainEvent, ipcMain } from 'electron';
import { readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import player from 'node-wav-player';
import { Lame } from 'node-lame';

function getRandomInt(max: number): number {
	return Math.floor(Math.random() * max);
}

async function convertBumpers(bumperPath: string) {
	await readdir(bumperPath, {
		recursive: true,
		withFileTypes: true,
	}).then(async (files) => {
		let soundFiles: string[] = [];
		for(let file of files) {
			if(file.isDirectory()) {
				continue;
			}
			const filename = `${join(file.path, file.name)}`;
			if(!filename.endsWith('.mp3')) {
				continue;
			}
			soundFiles.push(filename);
		}
		for(let soundFile of soundFiles) {
			const outputFile = soundFile+'.wav';
			let exists = true;
			await access(outputFile).catch((error) => {exists = false});
			if(exists) {
				continue;
			}
			const decoder = new Lame({
				output: outputFile,
			}).setFile(soundFile);
			decoder.decode().catch((error) => {
				console.error(error);
			});
		}
	}, (error) => {
		console.error(`path '${bumperPath}' could not read: ${error}`);
	});
}

const recentlyPlayedCount = 3;
let recentlyPlayedBumpers: string[] = [];
async function playBumpers(event: IpcMainEvent, numBumpers: number, bumperPath: string) {
	await convertBumpers(bumperPath);
	await readdir(bumperPath, {
		recursive: true,
		withFileTypes: true,
	}).then(async (files) => {
		let soundFiles: string[] = [];
		for(let file of files) {
			if(file.isDirectory()) {
				continue;
			}
			const filename = `${join(file.path, file.name)}`;
			if(!filename.endsWith('.wav')) {
				continue;
			}
			soundFiles.push(filename);
		}
		if(soundFiles.length === 0) {
			return;
		}
		for(let i = 0; i < numBumpers; i++) {
			let soundFile = soundFiles[getRandomInt(soundFiles.length)];
			for(let i = 0; i < 100 && soundFile in recentlyPlayedBumpers; i++) {
				soundFile = soundFiles[getRandomInt(soundFiles.length)];
			}
			recentlyPlayedBumpers.push(soundFile);
			if(recentlyPlayedBumpers.length > recentlyPlayedCount) {
				recentlyPlayedBumpers.shift();
			}
			console.log(recentlyPlayedBumpers);
			await player.play({
				path: soundFile,
				sync: true,
			}).catch((error: any) => {
				console.error(`failed to play file ${soundFile}\n${error}`);
			});
		}
	}, (error) => {
		console.error(`path '${bumperPath}' could not read: ${error}`);
	});
	event.sender.send('donePlayingBumpers');
}

ipcMain.on('playBumpers', playBumpers);