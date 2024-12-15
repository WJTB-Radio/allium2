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

export function ScheduleEdit() {
	const schedules = getSchedules();
	const schedule = getSchedule();
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
	return (
		<div>
			<div>
				<label>
					select a schedule
					<select
						value={schedule?.id ?? ""}
						onChange={(event) => {
							library.selectedSchedule = event.target.value;
							updateSettings();
						}}
					>
						{Object.entries(schedules).map(([id, schedule]) => (
							<option key={id} value={id}>
								{schedule.name}
							</option>
						))}
					</select>
				</label>
				<button
					onClick={() => {
						const id = generateId("schedule", schedules);
						library.schedules[id] = {
							id,
							name: "new schedule",
							blocks: [],
						};
						library.selectedSchedule = id;
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
					<hr />
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
								onMouseMove={(event) => {
									if (pressedBlock == undefined) return;
									const initialStartsAt =
										pressedBlock.startsAt;
									const initialEndsAt = pressedBlock.endsAt;
									let startsAt = initialStartsAt;
									let endsAt = initialEndsAt;
									const top =
										days[
											day
										].current?.getBoundingClientRect()
											.top ?? 0;
									const length = endsAt - startsAt;
									if (draggedEdge == undefined) {
										const ratio = Math.min(
											Math.max(
												(event.clientY - top - dragY) /
													(days[day].current
														?.offsetHeight ?? 0),
												0.0,
											),
											1.0 -
												length / (24 * 60 * 60 * 1000),
										);
										const time = snapTime(
											ratio * 24 * 60 * 60 * 1000 +
												day * 24 * 60 * 60 * 1000,
										);
										startsAt = time;
										endsAt = time + length;
									} else {
										if (
											startsAt <
												day * 24 * 60 * 60 * 1000 ||
											endsAt <
												day * 24 * 60 * 60 * 1000 ||
											startsAt >
												(day + 1) *
													24 *
													60 *
													60 *
													1000 ||
											endsAt >
												(day + 1) * 24 * 60 * 60 * 1000
										) {
											setDraggedEdge(undefined);
											return;
										}
										const ratio = Math.min(
											Math.max(
												(event.clientY - top) /
													(days[day].current
														?.offsetHeight ?? 0),
												0.0,
											),
											1.0,
										);
										const time = snapTime(
											ratio * 24 * 60 * 60 * 1000 +
												day * 24 * 60 * 60 * 1000,
										);
										if (draggedEdge == 0) {
											startsAt = Math.min(
												time,
												initialEndsAt - 1000 * 60 * 30,
											);
										} else {
											endsAt = Math.max(
												time,
												initialStartsAt +
													1000 * 60 * 30,
											);
										}
									}
									// dont run unnessecary updates
									if (
										startsAt == initialStartsAt &&
										endsAt == initialEndsAt
									)
										return;
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
