import { ReactNode } from "react";
import { library } from "../schedule";

export function ScheduleSelect(props: {
	children: ReactNode;
	defaultValue: string | undefined;
	onChange: (schedule: string) => void;
}) {
	return (
		<label>
			{props.children}
			<select
				value={
					props.defaultValue ??
					Object.keys(library.schedules)[0] ??
					""
				}
				onChange={(event) => {
					props.onChange(event.target.value);
				}}
			>
				{Object.entries(library.schedules).map(([id, schedule]) => (
					<option key={id} value={id}>
						{schedule.name}
					</option>
				))}
			</select>
		</label>
	);
}

export function BumperGroupSelect<O extends boolean>(props: {
	optional: O;
	children: ReactNode;
	defaultValue: string | undefined;
	onChange: (
		bumperGroup: O extends true ? string | undefined : string,
	) => void;
}) {
	return (
		<label>
			{props.children}
			<select
				value={
					props.defaultValue ??
					(props.optional
						? "unset"
						: Object.keys(library.bumperGroups)[0]) ??
					""
				}
				onChange={(event) => {
					props.onChange(
						(event.target.value == "unset"
							? undefined
							: event.target.value) as O extends true
							? string | undefined
							: string,
					);
				}}
			>
				{props.optional ? <option>unset</option> : undefined}
				{Object.entries(library.bumperGroups).map(([id, group]) => (
					<option key={id} value={id}>
						{group.name}
					</option>
				))}
			</select>
		</label>
	);
}

export function PlaylistSelect<O extends boolean>(props: {
	optional: O;
	children: ReactNode;
	defaultValue: string | undefined;
	onChange: (playlist: O extends true ? string | undefined : string) => void;
}) {
	return (
		<label>
			{props.children}
			<select
				value={
					props.defaultValue ??
					(props.optional
						? "unset"
						: Object.keys(library.playlists)[0]) ??
					""
				}
				onChange={(event) => {
					props.onChange(
						(event.target.value == "unset"
							? undefined
							: event.target.value) as O extends true
							? string | undefined
							: string,
					);
				}}
			>
				{props.optional ? <option>unset</option> : undefined}
				{Object.entries(library.playlists).map(([id, playlist]) => (
					<option key={id} value={id}>
						{playlist.name}
					</option>
				))}
			</select>
		</label>
	);
}
