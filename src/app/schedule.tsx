
export type Block = {
	id: number
	blockName: string
	spotifyURI: string | undefined
	shuffle: boolean
	overrun: boolean
	startsAt: number
	endsAt: number
	day: number
};
export function getCurrentBlock(): Block {
	return {
		id: 0,
		blockName: 'cool music',
		spotifyURI: '',
		shuffle: false,
		overrun: true,
		startsAt: 1,
		endsAt: 1000,
		day: 1,
	};
}