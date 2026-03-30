# OpenMAIC Receiver

`OpenMAIC Receiver` is the Windows-focused classroom shell for the fixed room receiver flow.

It is designed for classroom PCs that should stay on one room and automatically show whatever lesson the teacher publishes to that room.

## What This App Is

This is **not** the full OpenMAIC teacher application.

It is a thin Tauri 2 desktop shell that:

- stores a local `serverBaseUrl`
- stores a local `roomId`
- builds the remote receiver URL
- opens the room receiver in a desktop webview window

The actual classroom content still comes from your OpenMAIC server:

```text
<serverBaseUrl>/receiver/<roomId>
```

## Why A Shell Instead Of A Full Local Client

The current classroom delivery flow depends on:

- room delivery APIs
- published classroom snapshots
- remote classroom playback pages

So the correct packaging model is:

- **desktop shell**
- **remote receiver URL**
- **not an offline standalone player**

## Supported Deployment Model

For a real classroom, your OpenMAIC server must be reachable from the classroom PC.

Examples:

- `http://192.168.1.20:6001`
- `https://openmaic.school.example`

Do not use a teacher laptop's private `localhost` if the classroom PC is a different machine.

## Local Settings

The shell stores a small local config:

- `serverBaseUrl`
- `roomId`
- `autoFullscreen`
- `autoLaunch`

The startup screen lets the classroom operator enter these values and preview the final receiver URL.

## Development

Install dependencies:

```bash
pnpm install
```

Run the receiver shell in development mode:

```bash
pnpm receiver:tauri:dev
```

This opens the local shell UI. After entering `serverBaseUrl` and `roomId`, the shell opens the remote room receiver window.

## Build

Build the desktop package:

```bash
pnpm receiver:tauri:build
```

This uses the Tauri configuration in:

- `src-tauri/tauri.conf.json`

## Windows Packaging

The repo includes a Windows CI workflow:

- `.github/workflows/receiver-shell-windows.yml`

It runs on `windows-latest`, installs Node + pnpm + Rust, verifies receiver-shell tests, then runs:

```bash
pnpm receiver:tauri:build
```

Artifacts are uploaded from the generated Tauri bundle output.

## Recommended Classroom Usage

1. Deploy OpenMAIC to a LAN or cloud address accessible from the classroom PC
2. Build or install `OpenMAIC Receiver` on the classroom PC
3. Configure:
   - `serverBaseUrl`
   - `roomId`
4. Keep the receiver shell open fullscreen
5. Teachers publish lessons to that room from the workbench

## Receiver URL Example

If:

- `serverBaseUrl = http://192.168.1.20:6001`
- `roomId = room-802`

Then the app loads:

```text
http://192.168.1.20:6001/receiver/room-802
```

## Current Limitations

- Windows-first shell target; packaging should be performed on Windows or CI for `.exe` output
- No native auto-update yet
- No enterprise kiosk lockdown yet
- No offline classroom playback mode yet

## Next Recommended Improvements

- native settings reopen shortcut / menu
- stronger fullscreen recovery UX
- optional auto-start on boot
- Windows-specific kiosk guidance
