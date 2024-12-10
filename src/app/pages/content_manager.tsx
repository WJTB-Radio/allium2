import { useRecoilState } from "recoil";
import { currentPageState } from "../router";
import { GlobalSettings } from "./global_settings";
import { Playlists } from "./playlists";

export default function ContentManager() {
	const [_currentPage, setCurrentPage] = useRecoilState(currentPageState);
	return (
		<>
			<button onClick={() => setCurrentPage("dj")}>Logout</button>
			<Playlists />
			<GlobalSettings />
			<p>ContentManager</p>
		</>
	);
}
