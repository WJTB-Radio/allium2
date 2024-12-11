// https://stackoverflow.com/a/8860203
export function clearAllTimeouts() {
	var id = window.setTimeout(() => {}, 0);
	while (id--) {
		window.clearTimeout(id); // will do nothing if no timeout with id is present
	}
}
