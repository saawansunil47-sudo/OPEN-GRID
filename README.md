# Open Grid

An independent browser racing playground. Draw a circuit, choose any of 34 procedural vehicles, and drive. All included content is unlocked. No shop, paid currency, game exports, or payment integration.

## Run locally

From this project directory, run `python -m http.server 8000 --directory dist`, then open `http://localhost:8000`. All runtime assets, including Three.js, are bundled locally. The game runs entirely in the browser; there are no multiplayer, STUN, authentication, or database services.

## Included

- Freehand and node-based track editing, undo, reverse, image tracing, generators and local circuit saves.
- Adjustable road width, scale, elevation, banking, barriers, scenery, and tarmac/dirt/snow surfaces.
- Six environments and seven original preset circuits.
- 34 unlocked procedural vehicles with different dimensions, acceleration, maximum speed and grip.
- Arcade 3D driving, AI opponents, free practice, multi-lap races, open rally stages and drag sprints.
- Chase, bonnet and overhead cameras; keyboard, touch and standard-mapped gamepad input.
- Ordered checkpoints, sector and lap timing, local personal bests, replay ghosts and local statistics.
- Deterministic daily GT challenge; local records only.

## Controls

WASD/arrows: drive. Space: handbrake. R: recover (invalidates lap). C: camera. M: mute. H: horn. Escape: pause. Gamepad: left stick, right trigger throttle, left trigger brake, A handbrake, Y recover, X camera, Start pause.

## Verification

`node --test tests/core.test.mjs` checks deterministic track generation, vehicle data, checkpoint sequencing, off-road rejection, timing and drawing simplification.

`node tests/smoke.mjs` exercises application initialization, real Three.js geometry creation, garage/library, acceleration, AI, pausing, cameras/HUD, modes and environments using a minimal DOM and renderer stub. It is **not** a browser rendering test. WebGL visuals, mobile devices and actual gamepads have not been manually tested in this environment.

## Current boundaries

This is a first playable build, not feature-for-feature parity with another game. Vehicles use original primitive-based models and simplified arcade handling, not licensed models or a simulation-grade vehicle system. AI follows the centreline with preset offsets. Elevation and banking are global editor controls; there is no per-corner run-off editor, manual scenery placement, pit-lane editing or bridge/intersection handling. The circuit library contains original layouts, not surveyed real-world circuits. There is no cloud account sync, community track catalogue, global leaderboard, rewards progression, or multiplayer. The existing Sites deployment is private. Firebase Hosting deployment, if enabled, is publicly accessible by URL unless separately protected.

Data is stored in browser localStorage. Clearing browser data removes tracks, personal bests and stats. Graphical behaviour still needs real-device testing.

## Attribution

Three.js r170 is bundled under its MIT license; see `dist/THREE-LICENSE.txt`. Game code, UI, track layouts and models are original to this project. No Apex Drawn source code, artwork or branding is used.

## Firebase Hosting

This project is ready for **classic Firebase Hosting**, not Firebase App Hosting. `firebase.json` serves `dist/` directly, with no build step. It includes cache revalidation for unversioned app assets and the JavaScript MIME type for `.mjs` files. No Firebase SDK, API keys, Firestore rules, Cloud Functions or billing setup are needed in this source tree. Hosting plan limits still apply.

Choose a dedicated Firebase project to avoid replacing another app. The actual project ID is deliberately not hard-coded.

From the repository root:

```sh
npx -y firebase-tools@latest login
npx -y firebase-tools@latest projects:list
npx -y firebase-tools@latest emulators:start --only hosting --project YOUR_PROJECT_ID
```

Open the local address printed by the emulator. To deploy after choosing the correct project:

```sh
npx -y firebase-tools@latest deploy --only hosting --project YOUR_PROJECT_ID
```

Replace `YOUR_PROJECT_ID` with the actual ID from the Firebase console. Firebase Hosting serves a public URL; a private GitHub repository does not make the hosted game private. The Firebase deployment has not been performed yet.

Saved tracks and records are scoped to each browser origin. Moving from Sites to a Firebase URL starts a separate set of local saves; existing saves are not automatically migrated.

## F1 engine profile

Formula One (vehicle ID 1) uses parameters from the user-supplied `source-engines/ferrari-f138-v8.mr`: Ferrari Tipo 056-2013 V8, firing order 1-5-3-7-4-8-2-6, 18,000 RPM redline, seven original ratios, 3.5 final drive and 14-inch tyre radius. `dist/f1-engine.mjs` applies these to automatic gear/RPM behaviour. The default audio now uses recorded generic engine loops; additive synthesis remains only a download-failure fallback. The Formula E keeps its existing sound.

The recordings are **generic car audio**, not the original simulator audio or Ferrari recordings. It does not execute `.mr`, solve combustion/exhaust flow, or use the script's impulse responses. Idle (4,000 RPM), shift timing and tonal filtering are game-side choices. To reproduce the original sound, run the supplied script in a compatible Engine Simulator and record RPM/load loops. The source file is retained unchanged for that workflow.

Engine profile tests: `node --test tests/f1-engine.test.mjs`. Audio node routing is checked with a test stub; listening in a real browser remains unverified.

## Build 2026.10.14-B: sampled audio and handling

- Two bundled recorded engine loops, mixed by RPM and throttle, replace synthesis by default. The in-race AUDIO indicator reports loading, recorded playback, or download failure. Per-vehicle pitch profiles reuse these samples; this is not a pack of 34 distinct vehicle recordings. Credits and licence links are in `dist/audio/CREDITS.txt` and the game's Help dialog. No CDN required.
- Smoothed keyboard steering, speed-dependent steering lock and bounded yaw; tyre slip damps quickly unless the handbrake is applied. Brake-to-reverse has a delay.
- Continuous segment-based road contact and wall sliding remove vertex snapping. Fixed-step physics positions are interpolated for rendering. Existing lap records remain stored under the old handling version; new records are separate for fairness.
- All CSS backdrop blur removed. There was no motion-blur postprocessing. The camera no longer trails behind through position smoothing, and high-quality rendering uses up to native 2x pixel density.
- Instanced concrete panels, three steel rails, fence posts, reflectors, fasteners and wire catch fencing line both sides of the circuit. The Barriers toggle controls the full assembly.
- Versioned app/module URLs prevent reuse of previous JavaScript. The footer identifies this build explicitly.

Run `node --test tests/*.test.mjs` and `node tests/smoke.mjs`. Real-browser visual and listening QA remains unavailable in the build environment.

## Elevation studio — build 2026.10.14-C

The full-width studio uses top-toolbar menus for Layout, Road & scenery, Session and Elevation. Open Elevation to select a numbered layout point and set its height from 0–150 metres with the slider or numeric field. Preview in 3D shows the road and barriers following the new profile. Session → Rally stage makes the route open-ended. Save circuit includes point heights; dragging, reversing and undo retain them. Rolling hills replaces all point heights with a generated profile; Flatten all resets them. Existing saved circuits without point heights retain their former rolling-hills profile.

Main headings request locally installed Bauhaus 93. No proprietary font file is bundled; devices without the font use a fallback. A properly licensed webfont is needed for identical typography on all devices.

Validation includes integration checks for elevation geometry, dragging, save/load, reverse and undo. Browser visual QA was unavailable in this environment.

### Elevation geometry repair — build 2026.10.14-D
Height interpolation is now bounded between adjacent point heights, avoiding spline dips below the ground. Track-aligned embankments replace coarse terrain triangles across the roadway. Kerbs, fence wires and barrier lengths follow grades, and cars pitch with the sampled road slope. Regression tests cover isolated peaks/valleys and exact control-point heights. Browser visual verification remains unavailable.
