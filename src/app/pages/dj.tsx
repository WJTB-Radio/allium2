import { FormEvent } from "react";
import { useRecoilState } from "recoil";
import { currentPageState } from "../router";
import { fadeIn, fadeOut, isPlaying, playingAtom } from "../automation";

const fadeTimes = [300, 3000];
export default function DJ() {
	const [playing, setPlaying] = useRecoilState(playingAtom);
	return (
		<>
			<Login />
			{isPlaying()
				? fadeTimes.map((time) => {
						return (
							<button
								key={time}
								onClick={fadeOut.bind(undefined, time)}
							>
								fade out ({time}ms)
							</button>
						);
				  })
				: fadeTimes.map((time) => {
						return (
							<button
								onClick={fadeIn.bind(undefined, time)}
								key={time}
							>
								fade in ({time})ms
							</button>
						);
				  })}
			<p>{playing}</p>
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
