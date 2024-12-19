import { ReactNode } from "@tanstack/react-router";
import { NameType } from "../util/types";
import { useState } from "react";

export function OverrideEntry<
	TypeName extends "string" | "number" | "boolean",
	T = NameType<TypeName>,
>(
	props: {
		children: ReactNode;
		defaultValue: T | undefined;
		type: TypeName;
		onChange: (newValue: T | undefined) => void;
	} & (TypeName extends "number"
		? {
				min: number;
				max: number;
			}
		: TypeName extends "boolean"
			? { fallback: boolean }
			: {}),
) {
	const [value, setValue] = useState<T | undefined>(props.defaultValue);
	return (
		<div className="entry">
			<label>
				{props.children}
				<input
					type={
						props.type == "number"
							? "number"
							: props.type == "boolean"
								? "checkbox"
								: undefined
					}
					value={
						props.type == "boolean"
							? undefined
							: value == undefined
								? ""
								: (value as string | number)
					}
					checked={
						props.type == "boolean"
							? value == undefined
								? ((props as any)?.fallback as boolean)
								: (value as boolean)
							: undefined
					}
					min={
						props.type == "number"
							? ((props as any)?.min ?? undefined)
							: undefined
					}
					max={
						props.type == "number"
							? ((props as any)?.max ?? undefined)
							: undefined
					}
					onChange={(event) => {
						const value =
							props.type == "number"
								? event.target.value == ""
									? undefined
									: parseInt(event.target.value)
								: props.type == "boolean"
									? event.target.checked
									: event.target.value;
						setValue(value as T | undefined);
						props.onChange(value as T | undefined);
					}}
				/>
			</label>
			{value != undefined ? (
				<button
					onClick={() => {
						setValue(undefined);
						props.onChange(undefined);
					}}
				>
					remove override
				</button>
			) : undefined}
		</div>
	);
}
