import { createFileRoute } from "@tanstack/react-router";
import {
	globalSettings,
	globalSettingsSignal,
	library,
	Playlist,
} from "../schedule";
import { generateId } from "../util/id_generator";
import { useSignal } from "../util/signal";
import { beforeLoadAuth } from "../auth";
import { Fragment } from "react/jsx-runtime";
import { BumperGroupSelect } from "../entries/select";
import { OverrideEntry } from "../entries/override_entry";
import { DirectoryEntry } from "../entries/directory_entry";

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
		<div className="entries">
			<label className="entry">
				name
				<input
					onChange={(event) => {
						props.playlist.name = event.target.value;
						updateSettings();
					}}
					defaultValue={props.playlist.name}
				/>
			</label>
			<label className="entry">
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
			<label className="entry">
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
			<DirectoryEntry
				setValue={(value) => {
					props.playlist.directory = value;
					updateSettings();
				}}
				root={globalSettings.libraryPath ?? ""}
				value={props.playlist.directory}
			>
				music directory:
			</DirectoryEntry>
			<BumperGroupSelect
				optional={false}
				defaultValue={props.playlist.bumperGroup}
				onChange={(value) => {
					props.playlist.bumperGroup = value;
					updateSettings();
				}}
			>
				bumper group
			</BumperGroupSelect>
			<OverrideEntry
				defaultValue={props.playlist.numBumpersOverride}
				type={"number"}
				min={0}
				max={10}
				onChange={(value) => {
					props.playlist.numBumpersOverride = value;
					updateSettings();
				}}
			>
				num bumpers override
			</OverrideEntry>
			<OverrideEntry
				defaultValue={props.playlist.bumperIntervalOverride}
				type={"number"}
				min={0}
				max={30}
				onChange={(value) => {
					props.playlist.bumperIntervalOverride = value;
					updateSettings();
				}}
			>
				bumper interval override
			</OverrideEntry>
			<button className="entry" onClick={props.remove}>
				delete
			</button>
		</div>
	);
}
