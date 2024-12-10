// provide a fallback value and log an error if it gets used
// need to be fault tolerant :)
export function fallback<T>(
	value: T | undefined,
	fallback: T,
	name: string,
): T {
	if (value == undefined) {
		value = fallback;
		console.error(`fallback value used for ${name}`);
	}
	return value;
}
