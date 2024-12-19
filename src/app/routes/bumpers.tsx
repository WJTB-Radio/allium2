import { createFileRoute } from "@tanstack/react-router";
import { selectDirectory } from "../ipc";
import {
	BumperGroup,
	globalSettings,
	globalSettingsSignal,
	library,
} from "../schedule";
import { generateId } from "../util/id_generator";
import { joinPaths, removePathPrefix } from "../util/path";
import { useSignal } from "../util/signal";
import { beforeLoadAuth } from "../auth";
import { Fragment } from "react/jsx-runtime";
import { OverrideEntry } from "../entries/override_entry";
import { DirectoryEntry } from "../entries/directory_entry";

export const Route = createFileRoute("/bumpers")({
	component: Bumpers,
	beforeLoad: beforeLoadAuth,
});

export function Bumpers() {
	const updateSettings = useSignal(globalSettingsSignal);
	return (
		<div className="centerContainer">
			<h1>bumpers</h1>
			<hr />
			{Object.entries(library.bumperGroups).map(([id, bumperGroup]) => (
				<Fragment key={bumperGroup.id}>
					<BumperEdit
						bumperGroup={bumperGroup}
						remove={() => {
							delete library.bumperGroups[id];
							updateSettings();
						}}
						key={bumperGroup.id}
					/>
					<hr key={bumperGroup.id + "seperator"} />
				</Fragment>
			))}
			<button
				onClick={() => {
					const id = generateId("bumper-group", library.bumperGroups);
					library.bumperGroups[id] = {
						id,
						name: "",
						directory: "",
						bumperIntervalOverride: undefined,
						numBumpersOverride: undefined,
					};
					updateSettings();
				}}
			>
				add bumper group
			</button>
			<div className="spacer" />
		</div>
	);
}

function BumperEdit(props: { bumperGroup: BumperGroup; remove: () => void }) {
	const updateSettings = useSignal(globalSettingsSignal);
	return (
		<div className="entries">
			<label className="entry">
				name
				<input
					onChange={(event) => {
						props.bumperGroup.name = event.target.value;
						updateSettings();
					}}
					defaultValue={props.bumperGroup.name}
				/>
			</label>
			<DirectoryEntry
				root={globalSettings.libraryPath ?? ""}
				value={props.bumperGroup.directory}
				setValue={(value) => {
					props.bumperGroup.directory = value;
					updateSettings();
				}}
			>
				bumper path:
			</DirectoryEntry>
			<OverrideEntry
				defaultValue={props.bumperGroup.numBumpersOverride}
				type="number"
				min={0}
				max={10}
				onChange={(newValue) => {
					if (newValue == undefined) {
						props.bumperGroup.numBumpersOverride = undefined;
					} else {
						props.bumperGroup.numBumpersOverride =
							newValue as number;
					}
					updateSettings();
				}}
			>
				num bumpers override
			</OverrideEntry>
			<OverrideEntry
				defaultValue={props.bumperGroup.bumperIntervalOverride}
				type="number"
				min={0}
				max={10}
				onChange={(newValue) => {
					if (newValue == undefined) {
						props.bumperGroup.bumperIntervalOverride = undefined;
					} else {
						props.bumperGroup.bumperIntervalOverride =
							newValue as number;
					}
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
