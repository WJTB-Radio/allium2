import { contextBridge, ipcRenderer } from "electron";

const electronAPI = {
	openDirectory: (directory: string): Promise<string> =>
		ipcRenderer.invoke("openDirectory", directory),
	findSongs: (path: string): Promise<string[]> =>
		ipcRenderer.invoke("findSongs", path),
	loadSettings: (): Promise<string> => ipcRenderer.invoke("loadSettings"),
	saveSettings: (settings: string) =>
		ipcRenderer.invoke("saveSettings", settings),
	loadLibrary: (path: string) => ipcRenderer.invoke("loadLibrary", path),
	saveLibrary: (path: string, library: string) =>
		ipcRenderer.invoke("loadLibrary", path, library),
};

export type electronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
