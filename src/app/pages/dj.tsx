import { FormEvent } from "react";
import { useRecoilState } from "recoil";
import { currentPageState } from "../router";
import {
	cancelFadeOnSongEnd,
	durationAtom,
	fadeIn,
	fadeOnSongEnd,
	fadeOut,
	fadeOutOnSongEnd,
	getNext,
	playingAtom,
	skipNext,
	timeAtom,
} from "../automation";
import { useForceUpdate } from "../util/signal";
import styles from "./dj.module.css";

const fadeTimes = [300, 3000];
export default function DJ() {
	const [playing, _setPlaying] = useRecoilState(playingAtom);
	const [time, _setTime] = useRecoilState(timeAtom);
	const [duration, _setDuration] = useRecoilState(durationAtom);
	const next = getNext();
	const forceUpdate = useForceUpdate();
	return (
		<>
			<h1>allium :D</h1>
			<p>allium plays music when noone's show is on.</p>
			{playing != "" ? (
				<>
					{fadeOnSongEnd != undefined ? (
						<div className={styles.fadeOutWarning}>
							<span>
								{fadeOnSongEnd}ms fade out at end of song (
								{time} / {duration})
							</span>
							<div className={styles.spacer} />
							<button
								onClick={() => {
									cancelFadeOnSongEnd();
									forceUpdate();
								}}
							>
								cancel
							</button>
						</div>
					) : undefined}
					<table>
						<tbody>
							<tr>
								{fadeTimes.map((time) => {
									return (
										<td key={time}>
											<button
												onClick={() => {
													fadeOutOnSongEnd(time);
													forceUpdate();
												}}
											>
												fade out after song ({time}ms)
											</button>
										</td>
									);
								})}
							</tr>
							<tr>
								{fadeTimes.map((time) => {
									return (
										<td key={time}>
											<button
												onClick={() => {
													fadeOut(time);
												}}
											>
												fade out now ({time}ms)
											</button>
										</td>
									);
								})}
							</tr>
						</tbody>
					</table>
				</>
			) : (
				<table>
					<tbody>
						<tr>
							{fadeTimes.map((time) => {
								return (
									<td key={time}>
										<button
											onClick={() => {
												fadeIn(time);
											}}
										>
											fade in ({time}ms)
										</button>
									</td>
								);
							})}
						</tr>
					</tbody>
				</table>
			)}
			<div className={styles.nowPlaying}>
				<h2>now playing</h2>
				{playing && playing != "" ? (
					<>
						<p className={styles.song}>{playing}</p>
						<p className={styles.time}>
							{time} / {duration}
						</p>
					</>
				) : (
					<>
						<p>nothing</p>
					</>
				)}
			</div>
			<div className={styles.upNext}>
				<h2>up next</h2>
				{next.name != "" ? (
					<p className={styles.song}>{next.name}</p>
				) : undefined}
				<button
					onClick={async () => {
						await skipNext();
						forceUpdate();
					}}
				>
					skip
				</button>
			</div>
			<div className={styles.spacer}></div>
			<Login />
		</>
	);
}

function Login() {
	const [_currentPage, setCurrentPage] = useRecoilState(currentPageState);
	function login(event: FormEvent) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const password = formData.get("password");
		if (password === "shredded") {
			setCurrentPage("content_manager");
		} else if (password === "shredded2") {
			setCurrentPage("admin");
		} else {
			form.reset();
		}
	}

	return (
		<form onSubmit={login} className={styles.login}>
			<label>
				password
				<input name="password" type="password" />
			</label>
			<button type="submit">login</button>
		</form>
	);
}
