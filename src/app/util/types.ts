export type TypeName<T> = T extends string
	? "string"
	: T extends number
		? "number"
		: T extends boolean
			? "boolean"
			: T extends undefined
				? "undefined"
				: "object";

export type NameType<
	T extends "string" | "number" | "boolean" | "undefined" | "object",
> = T extends "string"
	? string
	: T extends "number"
		? number
		: T extends "boolean"
			? boolean
			: T extends "undefined"
				? undefined
				: object;
