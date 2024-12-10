// use the first non nullish value
export function override<T>(...args: T[]): T | undefined {
	return args.find((value) => value != undefined);
}
