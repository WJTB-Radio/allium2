import { createElement, useState } from 'react';
import Admin from './admin';
import ContentManager from './content_manager';
import DJ from './dj';
import { atom, useRecoilState } from 'recoil';

export type Page = keyof typeof pages;
export let pages = {
	'dj': DJ,
	'admin': Admin,
	'content_manager': ContentManager,
};

export let currentPageState = atom({
	key: 'currentPage',
	default: 'dj' as Page,
});

export function RouterOutlet() {
	const [currentPage, setCurrentPage] = useRecoilState(currentPageState);
	return createElement(pages[currentPage], {});
}