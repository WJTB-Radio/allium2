import { getElectronAPI } from "../ipc";

let pathSeperator: "/" | "\\" = "/";
async function initPath() {
	pathSeperator = (await getElectronAPI().getPlatform()) == "win32"
		? "\\"
		: "/";
}

// join paths together
// tolerant of non normalized paths
// joinPaths("/hello//", "world///") -> "hello/world"
export function joinPaths(...args: string[]): string {
	return args.map((path) => path.trim()).map((path, index) =>
		// dont trim leading slash from first path
		(index == 0 ? /(?<path>.*)\/*/ : /^\/*(?<path>.*)\/*/).exec(path)
			?.groups?.path
	).join(pathSeperator);
}

// remove prefix from path
export function removePathPrefix(
	prefix: string,
	path: string,
): string | undefined {
	path = path.trim();
	if (path.startsWith(prefix)) {
		return path.substring(prefix.length);
	} else {
		return undefined;
	}
}

export function baseName(path: string): string | undefined {
	return new RegExp(
		`(:?${pathSeperator}.*${pathSeperator})*(?<basename>.*)\\..*`,
	).exec(
		path,
	)?.groups
		?.basename;
}
