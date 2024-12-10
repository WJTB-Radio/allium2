export type IDTypes = "playlist" | "bumper-group" | "block" | "schedule";

function getIdString(type: IDTypes, offset: number): string {
	return `${type}-${
		(new Date().getTime() + Math.floor(Math.random() * 3000) + offset)
			.toString()
	}`;
}

// generate a unique id
export function generateId(type: IDTypes, object: object): string {
	let offset = 0;
	let id = getIdString(type, offset);
	while (id in object) {
		offset++;
		id = getIdString(type, offset);
		if (offset >= 1000) {
			console.error("taking a really long time to find an id");
		}
	}
	return id;
}
