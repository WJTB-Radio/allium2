import { FormEvent } from "react";
import { useRecoilState } from "recoil";
import { currentPageState } from "../router";
import { fadeOut } from "../automation";

const fadeOutTimes = [1000, 5000];
export default function DJ() {
	return (
		<>
			<Login />
			<p>placeholder</p>
			{fadeOutTimes.map((time) => {
				return (
					<button key={time} onClick={fadeOut.bind(undefined, time)}>
						fade out ({time}ms)
					</button>
				);
			})}
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
			<button type="submit">Login</button>
		</form>
	);
}
