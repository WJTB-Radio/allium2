// pick an item from the list that isnt in the recently used list
// and then add the chosen item to the recently used list
// will shrink the recently used list so its always at least one smaller than the list
export function shuffle<T>(list: T[], recentlyUsed: T[]): T | undefined {
	if (list.length == 0) {
		return undefined;
	}
	while (list.length <= recentlyUsed.length) {
		recentlyUsed.pop();
	}
	const recentlyUsedSet = new Set(recentlyUsed);
	const notRecentlyUsed = list.filter((item) => !recentlyUsedSet.has(item));
	const selected =
		notRecentlyUsed[Math.floor(Math.random() * notRecentlyUsed.length)];
	recentlyUsed.unshift(selected); // more efficient to unshift here instead of the loop earlier
	return selected;
}
