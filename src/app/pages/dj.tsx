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
	timeAtom,
} from "../automation";
import { useForceUpdate } from "../util/signal";

const fadeTimes = [300, 3000];
export default function DJ() {
	const [playing, _setPlaying] = useRecoilState(playingAtom);
	const [time, _setTime] = useRecoilState(timeAtom);
	const [duration, _setDuration] = useRecoilState(durationAtom);
	const next = getNext();
	const forceUpdate = useForceUpdate();
	return (
		<>
			<Login />
			{playing != "" ? (
				<>
					{fadeOnSongEnd != undefined ? (
						<div>
							<span>
								fading out in {fadeOnSongEnd}ms at end of song
							</span>
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
												fade out ({time}ms)
											</button>
										</td>
									);
								})}
							</tr>
						</tbody>
					</table>
				</>
			) : (
				fadeTimes.map((time) => {
					return (
						<button
							onClick={() => {
								fadeIn(time);
							}}
							key={time}
						>
							fade in ({time})ms
						</button>
					);
				})
			)}
			{playing && playing != "" ? (
				<p>
					{playing} at {time} / {duration}
				</p>
			) : undefined}
			{next.name != "" ? <p>up next: {next.name}</p> : undefined}
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
		<form onSubmit={login}>
			<label>
				password
				<input name="password" type="password" />
			</label>
			<button type="submit">login</button>
		</form>
	);
}
