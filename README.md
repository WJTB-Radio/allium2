# allium 2

allium 2 is [WJTB Radio](https://wjtbradio.com)'s radio automation software.

It integrates with [tuna](https://obsproject.com/forum/resources/tuna.843/) to display the currently playing song in obs.

allium allows our content manager to schedule playlists in weekly blocks, as well as tagging blocks with bumper groups that should play in between songs.

## development

One time setup:
```bash
npm install
```

To run:
```bash
npm run start
```

## building

To build:
```bash
npm run make -- -p TARGET
```

where TARGET is `win32` (for windows), `darwin` (for mac), or `linux` (for linux)
