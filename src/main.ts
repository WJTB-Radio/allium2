import {
	app,
	BrowserWindow,
	dialog,
	ipcMain,
	IpcMainInvokeEvent,
	protocol,
} from "electron";
import path from "path";
import started from "electron-squirrel-startup";
import fs from "fs/promises";
import { glob } from "glob";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}

app.commandLine.appendSwitch("--enable-features", "OverlayScrollbar");

let mainWindow: BrowserWindow;
const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			webSecurity: false,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	mainWindow.menuBarVisible = false;
	if (app.isPackaged) {
		mainWindow.removeMenu();
	}

	// and load the index.html of the app.
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(
				__dirname,
				`../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
			),
		);
	}

	// Open the DevTools.
	mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on("ready", () => {
	ipcMain.handle("openDirectory", openDirectory);
	ipcMain.handle("findSongs", findSongs);
	ipcMain.handle("saveSettings", saveSettings);
	ipcMain.handle("loadSettings", loadSettings);
	ipcMain.handle("saveLibrary", saveLibrary);
	ipcMain.handle("loadLibrary", loadLibrary);
	ipcMain.handle("getPlatform", () => process.platform);
	ipcMain.handle("getDebug", () => !app.isPackaged);
	createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

protocol.registerSchemesAsPrivileged([
	{
		scheme: "file",
		privileges: {
			standard: true,
			bypassCSP: true,
			allowServiceWorkers: true,
			supportFetchAPI: true,
			corsEnabled: true,
			stream: true,
		},
	},
	{
		scheme: "https",
		privileges: {
			standard: true,
			bypassCSP: true,
			allowServiceWorkers: true,
			supportFetchAPI: true,
			corsEnabled: true,
			stream: true,
		},
	},
]);

async function openDirectory(_event: IpcMainInvokeEvent, defaultPath: string) {
	const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
		title: "select a directory",
		defaultPath: defaultPath,
		properties: ["openDirectory"],
	});
	if (!canceled) {
		return filePaths[0];
	}
}

async function findSongs(_event: IpcMainInvokeEvent, path: string) {
	return await glob(
		[
			"**/*.wav",
			"**/*.mp3",
			"**/*.flac",
			"**/*.ogg",
			"**/*.aac",
			"**/*.alac",
			"**/*.amr",
			"**/*.m4a",
		],
		{
			cwd: path,
		},
	);
}

async function saveSettings(_event: IpcMainInvokeEvent, content: string) {
	return fs.writeFile("settings.json", content);
}

async function loadSettings() {
	return (await fs.readFile("settings.json").catch(() => "")).toString();
}

async function saveLibrary(
	_event: IpcMainInvokeEvent,
	path: string,
	content: string,
) {
	return fs.writeFile(`${path}/library.json`, content);
}

async function loadLibrary(_event: IpcMainInvokeEvent, path: string) {
	return (
		await fs.readFile(`${path}/library.json`).catch(() => "")
	).toString();
}
