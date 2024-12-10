// join paths together
// tolerant of non normalized paths
// joinPaths("/hello//", "world///") -> "hello/world"
export function joinPaths(...args: string[]) {
	return args.map((path) => path.trim()).map((path) =>
		/^\/*(?<path>.*)\/*/.exec(path)?.groups?.path
	).join("/");
}
