import { useRecoilState } from "recoil";
import { currentPageState } from "../router";
import { GlobalSettings } from "./global_settings";

export default function ContentManager() {
	const [_currentPage, setCurrentPage] = useRecoilState(currentPageState);
	return (
		<>
			<button onClick={() => setCurrentPage("dj")}>Logout</button>
			<GlobalSettings />
			<p>ContentManager</p>
		</>
	);
}
