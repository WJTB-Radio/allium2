import styles from "./schedule_edit.module.css";
import { createFileRoute } from "@tanstack/react-router";
import { beforeLoadAuth } from "../auth";
import {
	Block,
	getDefaultPlaylist,
	getPlaylist,
	getSchedule,
	getSchedules,
	getShuffle,
	globalSettingsSignal,
	library,
	Schedule,
} from "../schedule";
import { generateId } from "../util/id_generator";
import { useSignal } from "../util/signal";
import { formatIntWithMinDigits } from "../util/format";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
	arrow,
	autoUpdate,
	flip,
	FloatingArrow,
	FloatingFocusManager,
	limitShift,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
} from "@floating-ui/react";
import {
	BumperGroupSelect,
	PlaylistSelect,
	ScheduleSelect,
} from "../entries/select";
import { OverrideEntry } from "../entries/override_entry";

export const Route = createFileRoute("/schedule_edit")({
	component: ScheduleEdit,
	beforeLoad: beforeLoadAuth,
});

const defaultBlockMinutes = 30;
const dayNames = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];

export function ScheduleEdit() {
	const schedules = getSchedules();
	const scheduleIds = Object.keys(schedules).sort((a, b) =>
		a.localeCompare(b),
	);
	const defaultScheduleId =
		scheduleIds.length > 0
			? scheduleIds[scheduleIds.length - 1]
			: undefined;
	const [selectedSchedule, setSelectedSchedule] = useState<
		string | undefined
	>(getSchedule()?.id ?? defaultScheduleId);
	const hasSchedules = scheduleIds.length > 0;
	const schedule =
		selectedSchedule != undefined
			? (schedules[selectedSchedule] ??
				(defaultScheduleId != undefined
					? schedules[defaultScheduleId]
					: undefined))
			: undefined;
	const updateSettings = useSignal(globalSettingsSignal);
	const [pressedBlock, setPressedBlock] = useState<Block | undefined>(
		undefined,
	);
	const [dragStartX, setDragStartX] = useState(0);
	const [dragStartY, setDragStartY] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [dragY, setDragY] = useState(0);
	const [draggedEdge, setDraggedEdge] = useState<number | undefined>(
		undefined,
	);
	const days = [...Array(7).keys()].map((_) =>
		useRef<HTMLDivElement | null>(null),
	);
	function snapTime(time: number) {
		const r = 1000 * 60 * 15;
		return Math.round(time / r) * r;
	}
	useEffect(() => {
		function onMouseUp() {
			setPressedBlock(undefined);
			setDraggedEdge(undefined);
		}
		function onMouseLeave() {
			setPressedBlock(undefined);
			setDraggedEdge(undefined);
		}
		document.body.addEventListener("mouseup", onMouseUp);
		document.body.addEventListener("mouseleave", onMouseLeave);
		return () => {
			document.body.removeEventListener("mouseup", onMouseUp);
			document.body.removeEventListener("mouseleave", onMouseLeave);
		};
	}, [setPressedBlock]);
	function isOverlappingBlock(block: {
		startsAt: number;
		endsAt: number;
		id: string;
	}) {
		if (!schedule) return false;
		return (
			schedule.blocks.find(
				(other) =>
					other.id != block.id &&
					((other.startsAt < block.endsAt &&
						block.startsAt <= other.startsAt) ||
						(other.endsAt > block.startsAt &&
							block.endsAt >= other.endsAt) ||
						(block.startsAt >= other.startsAt &&
							block.endsAt <= other.endsAt) ||
						(block.startsAt <= other.startsAt &&
							block.endsAt >= other.endsAt)),
			) != undefined
		);
	}

	const dragThreshold = 10;
	function handleMouseMove(event: React.MouseEvent) {
		if (pressedBlock == undefined) return;
		const dx = event.clientX - dragStartX;
		const dy = event.clientY - dragStartY;
		if (dx * dx + dy * dy > dragThreshold * dragThreshold) {
			setIsDragging(true);
		}
		const initialStartsAt = pressedBlock.startsAt;
		const initialEndsAt = pressedBlock.endsAt;
		let startsAt = initialStartsAt;
		let endsAt = initialEndsAt;
		const length = endsAt - startsAt;
		if (draggedEdge == undefined) {
			const day = days.findIndex((day) =>
				day.current
					? event.clientX >
							day.current.getBoundingClientRect().left &&
						event.clientX <
							day.current.getBoundingClientRect().right
					: false,
			);
			if (day == -1) return;
			const top = days[day].current?.getBoundingClientRect().top ?? 0;
			const ratio = Math.min(
				Math.max(
					(event.clientY - top - dragY) /
						(days[day].current?.offsetHeight ?? 0),
					0.0,
				),
				1.0 - length / (24 * 60 * 60 * 1000),
			);
			const time = snapTime(
				ratio * 24 * 60 * 60 * 1000 + day * 24 * 60 * 60 * 1000,
			);
			startsAt = time;
			endsAt = time + length;
		} else {
			const day = Math.floor(
				pressedBlock.startsAt / (24 * 60 * 60 * 1000),
			);
			const top = days[day].current?.getBoundingClientRect().top ?? 0;
			const ratio = Math.min(
				Math.max(
					(event.clientY - top) /
						(days[day].current?.offsetHeight ?? 0),
					0.0,
				),
				1.0,
			);
			const time = snapTime(
				ratio * 24 * 60 * 60 * 1000 + day * 24 * 60 * 60 * 1000,
			);
			if (draggedEdge == 0) {
				startsAt = Math.min(time, initialEndsAt - 1000 * 60 * 30);
			} else {
				endsAt = Math.max(time, initialStartsAt + 1000 * 60 * 30);
			}
		}
		// dont run unnessecary updates
		if (startsAt == initialStartsAt && endsAt == initialEndsAt) return;
		// check if we are now overlapping with another block
		if (
			isOverlappingBlock({
				startsAt,
				endsAt,
				id: pressedBlock.id,
			})
		)
			return;
		pressedBlock.startsAt = startsAt;
		pressedBlock.endsAt = endsAt;
		updateSettings();
	}

	return (
		<div className={styles.container} onMouseMove={handleMouseMove}>
			<div className="entry">
				{hasSchedules ? (
					<ScheduleSelect
						defaultValue={schedule?.id}
						onChange={(schedule) => {
							setSelectedSchedule(schedule);
						}}
					>
						pick a schedule to edit
					</ScheduleSelect>
				) : undefined}
				<button
					onClick={() => {
						const id = generateId("schedule", schedules);
						library.schedules[id] = {
							id,
							name: "new schedule",
							blocks: [],
						};
						setSelectedSchedule(id);
						if (library.selectedSchedule == undefined) {
							library.selectedSchedule = id;
						}
						updateSettings();
					}}
				>
					new schedule
				</button>
			</div>
			<hr />
			{schedule != undefined ? (
				<>
					<div className="entry">
						<label>
							name
							<input
								value={schedule.name}
								onChange={(event) => {
									schedule.name = event.target.value;
									updateSettings();
								}}
							></input>
						</label>
						<button
							onClick={() => {
								delete library.schedules[schedule.id];
								setSelectedSchedule(defaultScheduleId);
								if (library.selectedSchedule == schedule.id) {
									library.selectedSchedule =
										defaultScheduleId;
								}
								updateSettings();
							}}
						>
							delete schedule
						</button>
						<button
							onClick={() => {
								const id = generateId("schedule", schedules);
								library.schedules[id] = {
									id,
									name: `copy of ${schedule.name}`,
									// need to make sure new blocks dont have the same ids
									blocks: schedule.blocks.reduce(
										(blocks, block) => {
											blocks.push({
												...block,
												id: generateId(
													"block",
													schedule.blocks.concat(
														blocks,
													),
												),
											});
											return blocks;
										},
										[] as Block[],
									),
								};
								setSelectedSchedule(id);
								if (library.selectedSchedule == undefined) {
									library.selectedSchedule = id;
								}
								updateSettings();
							}}
						>
							copy schedule
						</button>
					</div>
					<hr />
					<ul>
						<li>right click empty space to create a block</li>
						<li>drag to move blocks</li>
						<li>click to edit a block</li>
					</ul>
					<hr />
					<div className={styles.dayNames}>
						{[...Array(7).keys()].map((day) => (
							<h2 key={day} className={styles.dayName}>
								{dayNames[day]}
							</h2>
						))}
					</div>
					<div className={styles.ticks}>
						{[...Array(24 * 2 + 1).keys()]
							.map((i) => ({
								hour: Math.floor(i / 2),
								minute: (i % 2) * 30,
								ratio: i / (24 * 2),
							}))
							.map(({ hour, minute, ratio }) => (
								<div
									key={ratio}
									style={{
										position: "absolute",
										top: `${ratio * 100}%`,
									}}
									className={styles.tick}
								>{`${hour > 12 ? hour - 12 : hour == 0 ? 12 : hour}:${formatIntWithMinDigits(minute)} ${hour > 11 && hour != 24 ? "pm" : "am"}`}</div>
							))}
					</div>
					<div className={styles.week}>
						{[...Array(7).keys()].map((day) => (
							<div
								ref={days[day]}
								className={styles.day}
								key={day}
								onMouseDown={(event) => {
									if (event.button != 2) return;
									const ratio =
										event.nativeEvent.offsetY /
										(event.target as HTMLDivElement)
											.offsetHeight;
									const timeClicked = snapTime(
										ratio * 24 * 60 * 60 * 1000 +
											day * 24 * 60 * 60 * 1000,
									);
									let startsAt = timeClicked;
									const endsAt = Math.min(
										timeClicked +
											1000 * 60 * defaultBlockMinutes,
										(day + 1) * 24 * 60 * 60 * 1000,
									);
									startsAt = Math.min(
										startsAt,
										endsAt -
											1000 * 60 * defaultBlockMinutes,
									);
									if (
										isOverlappingBlock({
											startsAt,
											endsAt,
											id: "",
										})
									)
										return;
									schedule.blocks.push({
										id: generateId(
											"block",
											schedule.blocks,
										),
										playlist: getDefaultPlaylist(),
										startsAt,
										endsAt,
										bumperGroupOverride: undefined,
										bumperIntervalOverride: undefined,
										numBumpersOverride: undefined,
										shuffleOverride: undefined,
									});
									updateSettings();
								}}
							>
								{schedule.blocks
									.filter(
										(block) =>
											block.startsAt >=
												day * 24 * 60 * 60 * 1000 &&
											block.endsAt <=
												(day + 1) * 24 * 60 * 60 * 1000,
									)
									.map((block) => (
										<BlockEdit
											key={block.id}
											updateSettings={updateSettings}
											schedule={schedule}
											block={block}
											pressedBlock={pressedBlock}
											draggedEdge={draggedEdge}
											isDragging={isDragging}
											setIsDragging={setIsDragging}
											setDragStartX={setDragStartX}
											setDragStartY={setDragStartY}
											day={day}
											setDragY={setDragY}
											setPressedBlock={setPressedBlock}
											setDraggedEdge={setDraggedEdge}
										/>
									))}
							</div>
						))}
					</div>
				</>
			) : undefined}
		</div>
	);
}

function BlockEdit(props: {
	block: Block;
	pressedBlock: Block | undefined;
	draggedEdge: number | undefined;
	day: number;
	isDragging: boolean;
	setIsDragging: Dispatch<SetStateAction<boolean>>;
	setDragY: Dispatch<SetStateAction<number>>;
	setDragStartX: Dispatch<SetStateAction<number>>;
	setDragStartY: Dispatch<SetStateAction<number>>;
	setPressedBlock: Dispatch<SetStateAction<Block | undefined>>;
	setDraggedEdge: Dispatch<SetStateAction<number | undefined>>;
	schedule: Schedule;
	updateSettings: () => void;
}) {
	const arrowRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);
	if (props.isDragging && isOpen) setIsOpen(false);
	const { refs, floatingStyles, context } = useFloating({
		placement: "right",
		open: isOpen,
		onOpenChange: (o) => {
			if (!props.isDragging) setIsOpen(o);
		},
		middleware: [
			offset(10),
			flip({ fallbackAxisSideDirection: "start", crossAxis: false }),
			shift({ limiter: limitShift({ offset: 200 }), padding: 64 }),
			arrow({
				element: arrowRef,
				padding: 32,
			}),
		],
		whileElementsMounted: autoUpdate,
	});

	const click = useClick(context);
	const dismiss = useDismiss(context);
	const role = useRole(context);

	const { getReferenceProps, getFloatingProps } = useInteractions([
		click,
		dismiss,
		role,
	]);

	return (
		<>
			<div
				ref={refs.setReference}
				{...getReferenceProps()}
				className={`${styles.block} ${props.pressedBlock == props.block && props.draggedEdge == undefined ? styles.selected : ""}`}
				style={{
					top: `${100 * ((props.block.startsAt - props.day * 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000))}%`,
					height: `${100 * ((props.block.endsAt - props.block.startsAt) / (24 * 60 * 60 * 1000))}%`,
					backgroundColor: `${getPlaylist(props.block)?.color}aa`,
				}}
				onMouseDown={(event) => {
					event.stopPropagation();
					props.setDragY(event.nativeEvent.offsetY);
					props.setIsDragging(false);
					props.setDragStartX(event.clientX);
					props.setDragStartY(event.clientY);
					props.setPressedBlock(props.block);
				}}
			>
				{getPlaylist(props.block)?.name ?? ""}
				<div
					className={`${styles.topResize} ${props.pressedBlock == props.block && props.draggedEdge == 0 ? styles.selected : undefined}`}
					onMouseDown={(event) => {
						event.stopPropagation();
						props.setDragY(0);
						props.setIsDragging(false);
						props.setDragStartX(event.clientX);
						props.setDragStartY(event.clientY);
						props.setDraggedEdge(0);
						props.setPressedBlock(props.block);
					}}
					onClick={(event) => event.stopPropagation()}
				/>
				<div
					className={`${styles.bottomResize} ${props.pressedBlock == props.block && props.draggedEdge == 1 ? styles.selected : undefined}`}
					onMouseDown={(event) => {
						event.stopPropagation();
						props.setDragY(0);
						props.setIsDragging(false);
						props.setDragStartX(event.clientX);
						props.setDragStartY(event.clientY);
						props.setDraggedEdge(1);
						props.setPressedBlock(props.block);
					}}
					onClick={(event) => event.stopPropagation()}
				/>
			</div>
			{isOpen ? (
				<FloatingFocusManager context={context} modal={false}>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
						className={styles.popover}
					>
						<FloatingArrow
							style={{ transform: "translateY(-1px)" }}
							width={16}
							height={16}
							tipRadius={4}
							fill="#ffffff"
							stroke="#000000"
							strokeWidth={2}
							ref={arrowRef}
							context={context}
						/>
						<h2>edit block</h2>
						<hr />
						<div className="entries">
							<PlaylistSelect
								optional={false}
								defaultValue={props.block.playlist}
								onChange={(value) => {
									props.block.playlist = value;
									props.updateSettings();
								}}
							>
								playlist
							</PlaylistSelect>
							<OverrideEntry
								defaultValue={props.block.shuffleOverride}
								fallback={getShuffle(props.block)}
								type="boolean"
								onChange={(value) => {
									props.block.shuffleOverride = value;
									props.updateSettings();
								}}
							>
								shuffle override
							</OverrideEntry>
							<BumperGroupSelect
								optional={true}
								defaultValue={props.block.bumperGroupOverride}
								onChange={(value) => {
									props.block.bumperGroupOverride = value;
									props.updateSettings();
								}}
							>
								bumper group override
							</BumperGroupSelect>
							<OverrideEntry
								type="number"
								defaultValue={
									props.block.bumperIntervalOverride
								}
								onChange={(newValue) => {
									props.block.bumperIntervalOverride =
										newValue;
									props.updateSettings();
								}}
								min={0}
								max={30}
							>
								bumper interval override
							</OverrideEntry>
							<OverrideEntry
								type="number"
								defaultValue={props.block.numBumpersOverride}
								onChange={(newValue) => {
									props.block.numBumpersOverride = newValue;
									props.updateSettings();
								}}
								min={0}
								max={10}
							>
								num bumpers override
							</OverrideEntry>
							<button
								onClick={() => {
									props.setPressedBlock(undefined);
									setIsOpen(false);
									props.schedule.blocks =
										props.schedule.blocks.filter(
											(block) =>
												block.id != props.block.id,
										);
									props.updateSettings();
								}}
							>
								delete
							</button>
						</div>
					</div>
				</FloatingFocusManager>
			) : undefined}
		</>
	);
}
