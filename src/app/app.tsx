import { RecoilRoot } from "recoil";
import { RouterOutlet } from "./router";
import Automation from "./automation";
import { useEffect } from "react";
import { load } from "./schedule";

export function App() {
	useEffect(() => {
		load();
	}, []);
	return (
		<RecoilRoot>
			<Automation />
			<RouterOutlet />
		</RecoilRoot>
	);
}
