export function formatIntWithMinDigits(num: number, digits?: number) {
	if (!digits) digits = 2;
	return num.toLocaleString("en", {
		minimumIntegerDigits: digits,
	});
}

// format song time like 01:40
export function formatSongTime(time: number) {
	const hours = Math.floor(time / (60 * 60));
	const minutes = Math.floor((time / 60) % 60);
	const seconds = Math.floor(time) % 60;
	if (hours >= 1) {
		return `${formatIntWithMinDigits(hours)}:${
			formatIntWithMinDigits(minutes)
		}:${formatIntWithMinDigits(seconds)}`;
	} else {
		return `${formatIntWithMinDigits(minutes)}:${
			formatIntWithMinDigits(seconds)
		}`;
	}
}
