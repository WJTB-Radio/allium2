import { createFileRoute } from "@tanstack/react-router";
import { beforeLoadAuth } from "../auth";
import styles from "./schedule_edit.module.css";
import {
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

export const Route = createFileRoute("/schedule_edit")({
	component: ScheduleEdit,
	beforeLoad: beforeLoadAuth,
});

export function ScheduleEdit() {
	const schedules = getSchedules();
	const schedule = getSchedule();
	const updateSettings = useSignal(globalSettingsSignal);
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
								className={styles.day}
								key={day}
								onClick={(event) => {
									const ratio =
										event.nativeEvent.offsetY /
										(event.target as HTMLDivElement)
											.offsetHeight;
									const timeClicked =
										ratio * 24 * 60 * 60 * 1000 +
										day * 24 * 60 * 60 * 1000;
									console.log(timeClicked);
									schedule.blocks.push({
										id: generateId(
											"block",
											schedule.blocks,
										),
										playlist: getDefaultPlaylist(),
										startsAt: timeClicked,
										endsAt: timeClicked + 1000 * 60 * 60,
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
											block.startsAt >
												day * 24 * 60 * 60 * 1000 &&
											block.endsAt <
												(day + 1) * 24 * 60 * 60 * 1000,
									)
									.map((block) => (
										<div
											key={block.id}
											className={styles.block}
											style={{
												top: `${100 * ((block.startsAt - day * 24 * 60 * 60 * 1000) / (24 * 60 * 60 * 1000))}%`,
												height: `${100 * ((block.endsAt - block.startsAt) / (24 * 60 * 60 * 1000))}%`,
												backgroundColor: `${getPlaylist(block)?.color}aa`,
											}}
											onClick={(event) => {
												event.stopPropagation();
												console.log(
													(block.endsAt -
														block.startsAt) /
														(1000 * 60 * 60),
												);
											}}
										>
											{getPlaylist(block)?.name ?? ""}
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
