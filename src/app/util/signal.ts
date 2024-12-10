import { atom, RecoilState, useRecoilState } from "recoil";

// signals are recoil atoms that force an update

export function signal(key: string) {
	return atom<number>({ key, default: 0 });
}

export function useSignal(signal: RecoilState<number>) {
	const [value, update] = useRecoilState(signal);
	return () => {
		const inc = value + 1;
		update(isFinite(inc) ? inc : 0);
	};
}
