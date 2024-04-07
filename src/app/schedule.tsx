
export type Block = {
	id: number
	blockName: string
	spotifyURI: string | undefined
	shuffle: boolean
	overrun: boolean
	numBumpers: number
	bumperPath: string
	bumperInterval: number
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
		numBumpers: 2,
		bumperPath: '/home/julia/Music/bumpers',
		bumperInterval: 1,
		startsAt: 1,
		endsAt: 1000,
		day: 1,
	};
}