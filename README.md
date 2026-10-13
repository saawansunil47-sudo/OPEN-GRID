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
