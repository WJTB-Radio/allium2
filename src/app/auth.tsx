import { redirect } from "@tanstack/react-router";

let loggedIn = false;
export function logout() {
	loggedIn = false;
}

export function login(password: string): boolean {
	// oh boy this looks hard to hack
	loggedIn = password == "shredded";
	return loggedIn;
}

export function beforeLoadAuth({ location }: { location: { href: string } }) {
	if (!loggedIn) {
		throw redirect({
			to: "/",
			search: {
				redirect: location.href,
			},
		});
	}
}
