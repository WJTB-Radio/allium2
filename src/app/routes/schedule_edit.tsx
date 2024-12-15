import { createFileRoute } from "@tanstack/react-router";
import { beforeLoadAuth } from "../auth";
import styles from "./schedule_edit.module.css";
import {
	Block,
	getDefaultPlaylist,
	getPlaylist,
	getSchedule,
	getSchedules,
	globalSettingsSignal,
	library,
} from "../schedule";
import { generateId } from "../util/id_generator";
import { useSignal } from "../util/signal";
import { formatIntWithMinDigits } from "../util/format";
import { useEffect, useRef, useState } from "react";

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

	function handleMouseMove(event: React.MouseEvent) {
		if (pressedBlock == undefined) return;
		const day = Math.floor(pressedBlock.startsAt / (24 * 60 * 60 * 1000));
		const initialStartsAt = pressedBlock.startsAt;
		const initialEndsAt = pressedBlock.endsAt;
		let startsAt = initialStartsAt;
		let endsAt = initialEndsAt;
		const top = days[day].current?.getBoundingClientRect().top ?? 0;
		const length = endsAt - startsAt;
		if (draggedEdge == undefined) {
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
			<div>
				{hasSchedules ? (
					<label>
						edit a schedule
						<select
							value={schedule?.id ?? ""}
							onChange={(event) => {
								setSelectedSchedule(event.target.value);
							}}
						>
							{scheduleIds.map((id) => (
								<option key={id} value={id}>
									{schedules[id].name}
								</option>
							))}
						</select>
					</label>
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
								library.selectedSchedule = defaultScheduleId;
							}
							updateSettings();
						}}
					>
						delete schedule
					</button>
					<hr />
					<p>
						left click drag to move blocks. left click to set a
						block's playlist. right click empty space to create a
						block.
					</p>
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
										<div
											key={block.id}
											className={`${styles.block} ${pressedBlock == block && draggedEdge == undefined ? styles.selected : ""}`}
											style={{
												top: `${100 * ((block.startsAt - day * 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000))}%`,
												height: `${100 * ((block.endsAt - block.startsAt) / (24 * 60 * 60 * 1000))}%`,
												backgroundColor: `${getPlaylist(block)?.color}aa`,
											}}
											onMouseDown={(event) => {
												event.stopPropagation();
												setDragY(
													event.nativeEvent.offsetY,
												);
												setPressedBlock(block);
											}}
											onClick={(event) => {
												event.stopPropagation();
											}}
										>
											{getPlaylist(block)?.name ?? ""}
											<div
												className={`${styles.topResize} ${pressedBlock == block && draggedEdge == 0 ? styles.selected : undefined}`}
												onMouseDown={(event) => {
													event.stopPropagation();
													setDragY(0);
													setDraggedEdge(0);
													setPressedBlock(block);
												}}
											/>
											<div
												className={`${styles.bottomResize} ${pressedBlock == block && draggedEdge == 1 ? styles.selected : undefined}`}
												onMouseDown={(event) => {
													event.stopPropagation();
													setDragY(0);
													setDraggedEdge(1);
													setPressedBlock(block);
												}}
											/>
										</div>
									))}
							</div>
						))}
					</div>
				</>
			) : undefined}
		</div>
	);
}
