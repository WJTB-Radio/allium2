import { createFileRoute } from "@tanstack/react-router";
import { selectDirectory } from "../ipc";
import {
	globalSettings,
	globalSettingsSignal,
	library,
	Playlist,
} from "../schedule";
import { generateId } from "../util/id_generator";
import { joinPaths, removePathPrefix } from "../util/path";
import { useSignal } from "../util/signal";
import styles from "./list_edit.module.css";
import { beforeLoadAuth } from "../auth";
import { Fragment } from "react/jsx-runtime";

export const Route = createFileRoute("/playlists")({
	component: Playlists,
	beforeLoad: beforeLoadAuth,
});

export function Playlists() {
	const updateSettings = useSignal(globalSettingsSignal);
	return (
		<div className="centerContainer">
			<h1>playlists</h1>
			<hr />
			{Object.entries(library.playlists).map(([id, playlist]) => (
				<Fragment key={playlist.id}>
					<PlaylistEdit
						playlist={playlist}
						remove={() => {
							delete library.playlists[id];
							updateSettings();
						}}
					/>
					<hr />
				</Fragment>
			))}
			<button
				onClick={() => {
					const id = generateId("playlist", library.playlists);
					const bumperGroups = Object.values(library.bumperGroups);
					library.playlists[id] = {
						id,
						name: "",
						directory: "",
						color: "#888888",
						shuffle: true,
						bumperGroup:
							bumperGroups.length > 0
								? (bumperGroups[0]?.id ?? "")
								: "",
						bumperIntervalOverride: undefined,
						lastPlayed: undefined,
						numBumpersOverride: undefined,
					};
					updateSettings();
				}}
			>
				add playlist
			</button>
			<div className="spacer" />
		</div>
	);
}

function PlaylistEdit(props: { playlist: Playlist; remove: () => void }) {
	const updateSettings = useSignal(globalSettingsSignal);
	return (
		<div>
			<label className={styles.entry}>
				name
				<input
					onChange={(event) => {
						props.playlist.name = event.target.value;
						updateSettings();
					}}
					defaultValue={props.playlist.name}
				/>
			</label>
			<label className={styles.entry}>
				color
				<input
					type="color"
					defaultValue={props.playlist.color}
					onChange={(event) => {
						props.playlist.color = event.target.value;
						updateSettings();
					}}
				/>
			</label>
			<label className={styles.entry}>
				shuffle
				<input
					type="checkbox"
					defaultChecked={props.playlist.shuffle}
					onChange={(event) => {
						props.playlist.shuffle = event.target.checked;
						updateSettings();
					}}
				/>
			</label>
			<div className={styles.entry}>
				<span>
					{joinPaths(
						globalSettings.libraryPath ?? "",
						props.playlist.directory,
					)}
				</span>
				<button
					onClick={async () => {
						const selected = await selectDirectory(
							globalSettings.libraryPath ?? "",
						);
						if (selected == undefined) return;
						props.playlist.directory =
							removePathPrefix(
								globalSettings.libraryPath ?? "",
								selected,
							) ?? "";
						updateSettings();
					}}
				>
					select directory
				</button>
			</div>
			<label className={styles.entry}>
				bumper group
				<select
					defaultValue={props.playlist.bumperGroup}
					onChange={(event) => {
						props.playlist.bumperGroup = event.target.value;
						updateSettings();
					}}
				>
					{Object.values(library.bumperGroups).map((group) => (
						<option value={group.id} key={group.id}>
							{group.name}
						</option>
					))}
				</select>
			</label>
			<label className={styles.entry}>
				number of bumpers override
				<input
					type="number"
					value={props.playlist.numBumpersOverride ?? ""}
					min={0}
					max={10}
					onChange={(event) => {
						props.playlist.numBumpersOverride =
							event.target.value == ""
								? undefined
								: parseInt(event.target.value);
						updateSettings();
					}}
				/>
				{props.playlist.numBumpersOverride != undefined ? (
					<button
						onClick={() => {
							props.playlist.numBumpersOverride = undefined;
							updateSettings();
						}}
					>
						remove override
					</button>
				) : undefined}
			</label>
			<label className={styles.entry}>
				bumper interval override
				<input
					type="number"
					value={props.playlist.bumperIntervalOverride ?? ""}
					min={0}
					max={10}
					onChange={(event) => {
						props.playlist.bumperIntervalOverride =
							event.target.value == ""
								? undefined
								: parseInt(event.target.value);
						updateSettings();
					}}
				/>
				{props.playlist.bumperIntervalOverride != undefined ? (
					<button
						onClick={() => {
							props.playlist.bumperIntervalOverride = undefined;
							updateSettings();
						}}
					>
						remove override
					</button>
				) : undefined}
			</label>
			<button className={styles.entry} onClick={props.remove}>
				delete
			</button>
		</div>
	);
}
