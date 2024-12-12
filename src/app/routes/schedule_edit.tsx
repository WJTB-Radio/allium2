import { createFileRoute } from "@tanstack/react-router";
import { beforeLoadAuth } from "../auth";
import styles from "./schedule_edit.module.css";
import {
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
						{[...Array(24 * 2).keys()]
							.map((i) => ({
								hour: Math.floor(i / 2),
								minute: (i % 2) * 30,
								ratio: i / (24 * 2),
							}))
							.map(({ hour, minute, ratio }) => (
								<div
									style={{
										position: "absolute",
										top: `${ratio * 100}%`,
									}}
									className={styles.tick}
								>{`${hour > 12 ? hour - 12 : hour}:${formatIntWithMinDigits(minute)} ${hour > 11 ? "pm" : "am"}`}</div>
							))}
					</div>
					<div className={styles.week}>
						{[...Array(7).keys()].map((day) => (
							<div className={styles.day} key={day}>
								{day}
							</div>
						))}
					</div>
				</>
			) : undefined}
		</div>
	);
}
