import { RecoilRoot } from "recoil";
import { RouterOutlet } from "./router";
import Automation from "./automation";
import { Schedule } from "./schedule";

export function App() {
	return (
		<RecoilRoot>
			<Schedule />
			<Automation />
			<RouterOutlet />
		</RecoilRoot>
	);
}
