# Tauri 2 Receiver Shell Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Package the classroom receiver into a Tauri 2 desktop shell for classroom PCs so a teacher can publish to a room and the classroom computer can open a fixed receiver app instead of relying on a manually managed browser tab.

**Architecture:** Build a dedicated Tauri 2 desktop shell that wraps the existing remote classroom receiver flow instead of bundling the full OpenMAIC authoring application. The shell stores a small local config (`serverBaseUrl`, `roomId`, optional fullscreen preference), then launches a receiver window pointing to the remote room URL. The remote receiver page remains the source of truth for active classroom delivery; the desktop shell is only a durable launcher and runtime container.

**Tech Stack:** Tauri 2, Rust, static shell frontend (lightweight HTML/CSS/JS), existing Next.js receiver endpoint `/receiver/[roomId]`, local persistent config via Tauri store/plugin or app-local config file, Vitest for JS helpers.

## Packaging Review Summary

### Findings
- **Package only the receiver side**. Do not package the full teacher workbench.
- **Use a remote URL shell**, not an offline classroom runtime. The current delivery flow depends on server APIs and published classroom snapshots.
- **Do not embed the existing receiver page inside another iframe in the shell**. The current receiver already embeds `/classroom/[id]`, so wrapping it again would create nested iframe behavior and raise avoidable focus/audio/fullscreen risk.
- **Need a local configuration surface** for classroom setup:
  - `serverBaseUrl`
  - `roomId`
  - optional `autoFullscreen`
- **Need an app-level way to re-open settings** after launching the remote receiver. This should be handled by the Tauri shell itself, not by the remote receiver page.

### Recommendation
- Main window starts as a local shell UI.
- If config exists and is valid, the shell opens the remote receiver URL in a dedicated receiver window.
- Keep the settings window available via menu / shortcut for reconfiguration.

## Scope

### In Scope
- Tauri 2 project scaffold in this repo
- Receiver shell local config UI
- URL normalization / room launch helper
- Receiver window launch flow
- Basic fullscreen support
- Build / dev scripts
- Packaging docs

### Out of Scope
- Full teacher-side desktop client
- Offline classroom playback
- Tray integration
- Auto-update
- Device pairing UX beyond room ID entry
- Native kiosk lockdown beyond simple fullscreen

## Task 1: Add Receiver Shell Plan References and Config Helpers

**Files:**
- Create: `tests/server/receiver-shell-config.test.ts`
- Create: `lib/receiver-shell/config.ts`

**Step 1: Write the failing test**

Cover:
- normalize server URL
- build receiver URL from server + room
- reject empty room ID
- strip trailing slash from server URL

**Step 2: Run test to verify it fails**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-config.test.ts
```

Expected:
- FAIL because the config helper does not exist yet.

**Step 3: Implement minimal config helper**

Implement:
- `normalizeServerBaseUrl`
- `buildReceiverUrl`
- `isReceiverShellConfigValid`

**Step 4: Run test to verify it passes**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-config.test.ts
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add tests/server/receiver-shell-config.test.ts lib/receiver-shell/config.ts
git commit -m "feat: add receiver shell config helpers"
```

## Task 2: Scaffold Tauri 2 Receiver Shell

**Files:**
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/build.rs`
- Create: `src-tauri/src/main.rs`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/capabilities/default.json`
- Create: `receiver-shell-ui/index.html`
- Create: `receiver-shell-ui/styles.css`
- Create: `receiver-shell-ui/main.js`
- Modify: `package.json`

**Step 1: Write the failing smoke test**

Create a minimal JS-level smoke test if needed for shell frontend config defaults:
- `tests/server/receiver-shell-ui.test.ts`

**Step 2: Run test to verify it fails**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-ui.test.ts
```

Expected:
- FAIL because the shell UI files do not exist.

**Step 3: Create the Tauri 2 skeleton**

Requirements:
- Product name: `OpenMAIC Receiver`
- Dedicated receiver shell, not main web app packaging
- Local shell frontend loads first
- No assumption that `cargo tauri` already exists globally

**Step 4: Add package scripts**

Suggested scripts:
- `receiver:tauri:dev`
- `receiver:tauri:build`

**Step 5: Run static verification**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-ui.test.ts
```

Expected:
- PASS

**Step 6: Commit**

```bash
git add src-tauri receiver-shell-ui package.json tests/server/receiver-shell-ui.test.ts
git commit -m "feat: scaffold tauri 2 receiver shell"
```

## Task 3: Add Local Settings UI for Classroom PCs

**Files:**
- Modify: `receiver-shell-ui/index.html`
- Modify: `receiver-shell-ui/main.js`
- Modify: `receiver-shell-ui/styles.css`
- Create: `tests/server/receiver-shell-config.test.ts` (extend)

**Step 1: Write the failing test**

Cover helper behavior for:
- loading saved config
- validating config
- computing launch URL

**Step 2: Run test to verify it fails**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-config.test.ts
```

Expected:
- FAIL for the new helper assertions.

**Step 3: Implement local settings**

Fields:
- server URL
- room ID
- auto fullscreen

Behavior:
- save config locally
- show the exact receiver URL preview
- show validation errors before launch

**Step 4: Run test to verify it passes**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-config.test.ts
```

Expected:
- PASS

**Step 5: Commit**

```bash
git add receiver-shell-ui/index.html receiver-shell-ui/main.js receiver-shell-ui/styles.css tests/server/receiver-shell-config.test.ts lib/receiver-shell/config.ts
git commit -m "feat: add receiver shell settings UI"
```

## Task 4: Launch Receiver Window From Shell

**Files:**
- Modify: `src-tauri/src/main.rs`
- Modify: `receiver-shell-ui/main.js`
- Test: `tests/server/receiver-shell-config.test.ts`

**Step 1: Write the failing behavior test**

Cover the JS helper that decides whether to open local settings or remote receiver URL.

**Step 2: Run test to verify it fails**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-config.test.ts
```

Expected:
- FAIL for launch-mode behavior.

**Step 3: Implement launch behavior**

Recommended approach:
- keep local settings in the main shell page
- open the remote receiver in a dedicated receiver window
- allow reopening settings later from the main window

**Step 4: Manual verification**

Run:
```bash
pnpm receiver:tauri:dev
```

Expected:
- local shell UI opens
- entering server URL + room ID opens the remote receiver window

**Step 5: Commit**

```bash
git add src-tauri/src/main.rs receiver-shell-ui/main.js tests/server/receiver-shell-config.test.ts
git commit -m "feat: open remote receiver window from tauri shell"
```

## Task 5: Add Fullscreen and Recovery Controls

**Files:**
- Modify: `src-tauri/src/main.rs`
- Modify: `receiver-shell-ui/main.js`
- Modify: `receiver-shell-ui/index.html`

**Step 1: Write the failing helper test**

Cover:
- fullscreen preference serialization
- recovery/config mode state

**Step 2: Run test to verify it fails**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-config.test.ts
```

Expected:
- FAIL for fullscreen/recovery settings.

**Step 3: Implement recovery controls**

Add:
- fullscreen toggle
- “reopen settings” action
- “reload receiver” action

**Step 4: Manual verification**

Run:
```bash
pnpm receiver:tauri:dev
```

Expected:
- receiver can be reopened/reloaded without editing code
- fullscreen preference is honored

**Step 5: Commit**

```bash
git add src-tauri/src/main.rs receiver-shell-ui/index.html receiver-shell-ui/main.js
git commit -m "feat: add fullscreen and recovery controls to receiver shell"
```

## Task 6: Packaging Documentation

**Files:**
- Create: `docs/tauri-receiver-shell.md`
- Modify: `README.md`
- Modify: `README-zh.md`

**Step 1: Write doc checklist**

Document:
- install prerequisites
- configure shell
- launch dev
- build desktop package
- deploy on classroom PC

**Step 2: Write docs**

Include:
- why this shell is remote-only
- what URL the classroom PC should use
- how to recover if server becomes unavailable

**Step 3: Final verification**

Run:
```bash
pnpm vitest run tests/server/receiver-shell-config.test.ts tests/server/receiver-shell-ui.test.ts
```

Expected:
- PASS

**Step 4: Commit**

```bash
git add docs/tauri-receiver-shell.md README.md README-zh.md
git commit -m "docs: add tauri receiver shell guide"
```

## Acceptance Criteria

- The repo contains a valid Tauri 2 receiver-shell scaffold.
- A classroom PC operator can enter `serverBaseUrl` and `roomId`.
- The shell can launch the room receiver URL in a desktop webview.
- The shell has a recoverable path back to settings.
- The shell is clearly scoped to classroom receiving only, not teacher authoring.

## Risks

- **Remote receiver page changes could break the shell**
  - Mitigation: keep shell thin and rely on stable `/receiver/[roomId]`.

- **Nested iframe behavior if we wrap the existing receiver page**
  - Mitigation: open the remote receiver as a top-level receiver window, not inside an iframe.

- **No global Tauri CLI installed**
  - Mitigation: use project-local scripts and document the install path.
