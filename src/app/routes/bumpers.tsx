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
			<div className="entry">
				<span>
					{joinPaths(
						globalSettings.libraryPath ?? "",
						props.bumperGroup.directory,
					)}
				</span>
				<button
					onClick={async () => {
						const selected = await selectDirectory(
							globalSettings.libraryPath ?? "",
						);
						if (selected == undefined) return;
						props.bumperGroup.directory =
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
			<label className="entry">
				number of bumpers override
				<input
					type="number"
					value={props.bumperGroup.numBumpersOverride ?? ""}
					min={0}
					max={10}
					onChange={(event) => {
						props.bumperGroup.numBumpersOverride =
							event.target.value == ""
								? undefined
								: parseInt(event.target.value);
						updateSettings();
					}}
				/>
				{props.bumperGroup.numBumpersOverride != undefined ? (
					<button
						onClick={() => {
							props.bumperGroup.numBumpersOverride = undefined;
							updateSettings();
						}}
					>
						remove override
					</button>
				) : undefined}
			</label>
			<label className="entry">
				bumper interval override
				<input
					type="number"
					value={props.bumperGroup.bumperIntervalOverride ?? ""}
					min={0}
					max={10}
					onChange={(event) => {
						props.bumperGroup.bumperIntervalOverride =
							event.target.value == ""
								? undefined
								: parseInt(event.target.value);
						updateSettings();
					}}
				/>
				{props.bumperGroup.bumperIntervalOverride != undefined ? (
					<button
						onClick={() => {
							props.bumperGroup.bumperIntervalOverride =
								undefined;
							updateSettings();
						}}
					>
						remove override
					</button>
				) : undefined}
			</label>
			<button className="entry" onClick={props.remove}>
				delete
			</button>
		</div>
	);
}
