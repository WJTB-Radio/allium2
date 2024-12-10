import { useRecoilState } from "recoil";
import { currentPageState } from "../router";

export default function Admin() {
	const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
	return (
		<>
			<button onClick={() => setCurrentPage("dj")}>Logout</button>
			<p>Admin</p>
		</>
	);
}
