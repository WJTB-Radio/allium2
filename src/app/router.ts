import { createElement } from "react";
import Admin from "./pages/admin";
import ContentManager from "./pages/content_manager";
import DJ from "./pages/dj";
import { atom, useRecoilState } from "recoil";

export type Page = keyof typeof pages;
export const pages = {
	"dj": DJ,
	"admin": Admin,
	"content_manager": ContentManager,
};

export const currentPageState = atom({
	key: "currentPage",
	default: "dj" as Page,
});

export function RouterOutlet() {
	const [currentPage] = useRecoilState(currentPageState);
	return createElement(pages[currentPage], {});
}
