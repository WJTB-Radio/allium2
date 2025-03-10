# allium2

Allium2 is [WJTB Radio](https://wjtbradio.com)'s radio automation software.

It integrates with [tuna](https://obsproject.com/forum/resources/tuna.843/) to display the currently playing song in obs.

Allium's primary goal is simplicity. Our DJs were uncomfortable operating [RadioDJ](https://www.radiodj.ro/) due to it's complexity. allium, by virtue of being simple, is also easy to understand for them.

![a screenshot of allium2's DJ interface](/screenshots/dj_view.png)
![a screenshot of allium2's DJ interface that shows a fade out in progress](/screenshots/fade_out.png)

Allium also allows our content manager to schedule playlists in weekly blocks, as well as tagging blocks with bumper groups that should play in between songs. This high level interface makes it simpler to program.

![a screenshot of allium2's block scheduler](/screenshots/block_scheduler.png)

## Installation

You can download the appropriate build for your computer on the [releases page](https://github.com/WJTB-Radio/allium2/releases).

## Development

One time setup:
```bash
npm install
```

To run:
```bash
npm run start
```

## Building

To build:
```bash
npm run make -- -p TARGET
```

where TARGET is `win32` (for windows), `darwin` (for mac), or `linux` (for linux)
