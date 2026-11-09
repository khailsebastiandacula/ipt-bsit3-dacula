# UConnect Frontend System Rundown

This document explains how the frontend works, what each file is for, and how to debug problems

## 1) What This Frontend Does

The frontend is an Angular application that provides:

- A public home page for announcements and quick campus info.
- A map page for viewing/searching locations.
- An admin page for creating, editing, and deleting announcements.

It talks to backend APIs through service classes and uses runtime environment injection (`public/env.js`) so API base URLs can be changed without rebuilding code.

## 2) Runtime Flow (From Page Load to Data on Screen)

1. Browser loads `src/index.html`.
2. `env.js` is loaded before Angular starts.
3. `src/main.ts` bootstraps Angular using `appConfig`.
4. `src/app/app.config.ts` wires router, HTTP, and service worker.
5. `src/app/app.ts` and `src/app/app.html` render shell layout (header, router outlet, bottom nav).
6. Router lazily loads page components from `src/app/pages/*`.
7. Pages call API services in `src/app/core/services/*`.
8. Services use models in `src/app/core/models/*` and runtime config in `src/app/core/config/runtime-env.ts`.
9. Templates render data and empty states.

## 3) Main Debug Path (Recommended)

When something is broken, check in this order:

1. Environment setup

- Confirm `public/env.js` exists and has the expected API base URL.
- Confirm `scripts/sync-env.mjs` ran (`npm run start`, `npm run build`, and `npm run watch` all run it first).

2. API connectivity

- Open browser DevTools Network tab.
- Verify requests to `/api/announcements` and `/api/locations` are returning expected data.

3. State update in component

- Check `signal()` data values in page component logic after API calls.
- Confirm computed values are based on current state.

4. Template rendering

- Verify Angular control flow (`@if`, `@for`, `@empty`) conditions are correct.
- Check class bindings for visual states (priority classes, selected markers, etc.).

5. CSS/layout

- Confirm styles in component `.scss` files are not hiding content.
- For map issues, verify map container height and Leaflet initialization timing.

## 4) File-by-File Rundown (All Frontend Files)

## A. Root and Tooling Files

### `UConnect-Frontend/package.json`

Purpose:

- Defines dependencies, scripts, and Angular build/test tooling.

How it affects behavior:

- `prestart`, `prebuild`, and `prewatch` run `scripts/sync-env.mjs` before Angular commands.

Debug checks:

- If runtime API URL is wrong, verify these pre-scripts executed.

### `UConnect-Frontend/package-lock.json`

Purpose:

- Locks exact dependency versions for reproducible installs.

Debug checks:

- If one machine works and another does not, re-install from lockfile.

### `UConnect-Frontend/angular.json`

Purpose:

- Angular workspace build/serve/test configuration.

How it affects behavior:

- Includes service worker setup and build budgets.

Debug checks:

- Build size errors and PWA config issues often trace here.

### `UConnect-Frontend/ngsw-config.json`

Purpose:

- Service worker caching rules for app assets and API requests.

How it affects behavior:

- In production, stale or cached API results may come from this strategy.

Debug checks:

- If prod data looks old, inspect service worker cache behavior.

### `UConnect-Frontend/tsconfig.json`

Purpose:

- Base TypeScript rules (strictness, module settings, path behavior).

Debug checks:

- Type-level build failures point here first.

### `UConnect-Frontend/tsconfig.app.json`

Purpose:

- TypeScript config for app source build.

Debug checks:

- App-only build errors and include/exclude scope issues.

### `UConnect-Frontend/tsconfig.spec.json`

Purpose:

- TypeScript config for tests.

Debug checks:

- Test compilation/type errors.

### `UConnect-Frontend/README.md`

Purpose:

- Basic Angular commands and developer entry points.

### `UConnect-Frontend/.env.example`

Purpose:

- Example env variables used by `sync-env.mjs`.

Debug checks:

- If someone sets up project for first time, this is the starting template.

### `UConnect-Frontend/.editorconfig`

Purpose:

- Editor formatting defaults.

### `UConnect-Frontend/.gitignore`

Purpose:

- Ignore rules for generated/build files.

### `UConnect-Frontend/.vscode/extensions.json`

Purpose:

- Recommended VS Code extensions for this frontend.

### `UConnect-Frontend/.vscode/launch.json`

Purpose:

- Debug launch profiles.

### `UConnect-Frontend/.vscode/tasks.json`

Purpose:

- VS Code task automation (build/run shortcuts).

### `UConnect-Frontend/.cursor/rules/cursor.mdc`

Purpose:

- Local tooling/assistant guidance file.

## B. Runtime Environment and Public Assets

### `UConnect-Frontend/scripts/sync-env.mjs`

Purpose:

- Reads env values and writes `public/env.js` for runtime config.

Why important:

- This is the bridge between local/deployment env vars and frontend API URL.

Debug checks:

- If requests hit wrong host, inspect this script and generated output.

### `UConnect-Frontend/public/env.js`

Purpose:

- Runtime config injected into browser (`window.__env`).

Why important:

- API services depend on this for base URL.

Debug checks:

- In DevTools Console, inspect `window.__env`.

### `UConnect-Frontend/public/manifest.webmanifest`

Purpose:

- PWA metadata (name, theme, icons).

### `UConnect-Frontend/public/favicon.ico`

Purpose:

- Browser tab icon.

### `UConnect-Frontend/public/icons/icon-192.svg`

Purpose:

- PWA icon asset.

### `UConnect-Frontend/public/icons/icon-512.svg`

Purpose:

- PWA icon asset.

### `UConnect-Frontend/public/brand/liceo-logo.png`

Purpose:

- Brand/logo image used in UI.

## C. Angular Entry and Global UI Files

### `UConnect-Frontend/src/index.html`

Purpose:

- Base HTML shell and script/style entry.

How it affects behavior:

- Must load `env.js` before Angular bootstrap.

### `UConnect-Frontend/src/main.ts`

Purpose:

- Bootstraps Angular app with `App` and `appConfig`.

Debug checks:

- If app fails before render, startup errors surface here.

### `UConnect-Frontend/src/styles.scss`

Purpose:

- Global styles, design tokens/variables, and shared imports.

Debug checks:

- Global visual regressions or icon/font import issues.

## D. App Shell and Routing

### `UConnect-Frontend/src/app/app.config.ts`

Purpose:

- Provides Angular app-level dependencies.

Key wiring:

- Router providers.
- HTTP client providers.
- Service worker registration behavior.

### `UConnect-Frontend/src/app/app.ts`

Purpose:

- Root component class.

How it is used:

- Hosts global shell + outlet composition.

### `UConnect-Frontend/src/app/app.html`

Purpose:

- Root shell template.

UI structure:

- Fixed header.
- Main route content container.
- Bottom navigation for home/map/admin.

### `UConnect-Frontend/src/app/app.scss`

Purpose:

- Root shell layout and responsive spacing.

### `UConnect-Frontend/src/app/app.routes.ts`

Purpose:

- Route map with lazy loaded page components.

Debug checks:

- Broken navigation, lazy import issues, route mismatches.

### `UConnect-Frontend/src/app/app.spec.ts`

Purpose:

- Basic app-level tests.

## E. Core Config, Models, and Services

### `UConnect-Frontend/src/app/core/config/runtime-env.ts`

Purpose:

- Reads runtime config from `window.__env` and exposes API base URL config.

Debug checks:

- If frontend calls wrong backend URL, check this file + `public/env.js`.

### `UConnect-Frontend/src/app/core/models/announcements/announcement.models.ts`

Purpose:

- Announcement-related TypeScript types and payload contracts.

Why important:

- Keeps service/component payload shape consistent and type-safe.

### `UConnect-Frontend/src/app/core/models/locations/location.models.ts`

Purpose:

- Location-related TypeScript types used by map and home features.

### `UConnect-Frontend/src/app/core/services/announcements/announcements-api.service.ts`

Purpose:

- Encapsulates all announcement API calls.

Typical methods:

- Fetch public/admin announcement lists.
- Validate admin key.
- Create/update/delete announcement operations.

Debug checks:

- Verify request headers (`x-admin-key`) and endpoint paths here first.

### `UConnect-Frontend/src/app/core/services/locations/locations-api.service.ts`

Purpose:

- Encapsulates location retrieval/search API calls.

Debug checks:

- If search results mismatch expectations, inspect query parameter construction here.

## F. Page: Home

### `UConnect-Frontend/src/app/pages/home/home.component.ts`

Purpose:

- Home page logic (load announcements + locations, derive counts/stats).

Key logic:

- On init, fetches API data and updates signals.
- Computes dashboard values (for example high-priority and college counts).

Debug checks:

- If cards show wrong values, inspect computed logic and API responses.

### `UConnect-Frontend/src/app/pages/home/home.component.html`

Purpose:

- Home page UI layout and control-flow rendering.

Debug checks:

- Verify `@if/@for/@empty` blocks match expected data state.

### `UConnect-Frontend/src/app/pages/home/home.component.scss`

Purpose:

- Home-specific styling, including priority visual treatments.

## G. Page: Map

### `UConnect-Frontend/src/app/pages/map/map.component.ts`

Purpose:

- Map page logic and Leaflet integration.

Key logic:

- Initializes map and tiles.
- Loads locations and filters by search/category.
- Creates and updates markers.
- Handles selection state and fallback coordinates when needed.

Debug checks:

- If map is blank, verify map init lifecycle and container size.
- If pins are wrong/missing, inspect location coordinates and filter state.

### `UConnect-Frontend/src/app/pages/map/map.component.html`

Purpose:

- Map UI for search/filter panel, map canvas, location list/details.

### `UConnect-Frontend/src/app/pages/map/map.component.scss`

Purpose:

- Map page styling (chip states, marker legend section, responsive layout).

## H. Page: Admin

### `UConnect-Frontend/src/app/pages/admin/admin.component.ts`

Purpose:

- Admin workflow logic for key validation and announcement CRUD.

Key logic:

- Reads/saves admin key (local storage).
- Validates admin key via backend.
- Opens edit/create form and submits payload.
- Reloads list after mutations.

Debug checks:

- 401 errors usually mean key mismatch/header issue.
- Form submission failures are commonly payload validation issues.

### `UConnect-Frontend/src/app/pages/admin/admin.component.html`

Purpose:

- Admin screen structure: key input, error state, form, and list actions.

### `UConnect-Frontend/src/app/pages/admin/admin.component.scss`

Purpose:

- Admin-specific visual states (valid/invalid key state, action styling).

## 5) Feature Data Flows

## A. Announcements (Public)

1. Home component initializes.
2. `announcements-api.service` calls public announcements endpoint.
3. Response is stored in signal state.
4. Home template loops through announcements.
5. Empty list path is rendered by template if needed.

## B. Locations (Map)

1. Map component initializes and calls locations API service.
2. Locations populate signal state.
3. Computed filters combine search text and selected category.
4. Leaflet markers are re-rendered from filtered state.
5. Selecting marker/list item updates selected location panel.

## C. Admin Announcement CRUD

1. User enters admin key.
2. Frontend calls admin auth endpoint with `x-admin-key`.
3. If valid, form actions are enabled.
4. Create/update/delete actions call admin endpoints.
5. After success, component reloads announcement list.

## 6) Practical Debug Checklist

Use this exact sequence:

1. Validate runtime config

- Check `public/env.js` and `window.__env`.

2. Validate backend reachability

- Confirm backend server is running and accessible from frontend host.

3. Validate API request/response

- Use Network tab to inspect URL, headers, status codes, and payloads.

4. Validate component state

- Log signal values after API calls.

5. Validate template conditions

- Confirm `@if/@for/@empty` branches behave as expected.

6. Validate CSS/layout

- Confirm elements are not hidden/overlapped by fixed UI or container sizing.

7. Validate cache effects in production

- Check service worker behavior if stale results appear.

## 7) Frontend Mental Model (Quick Summary)

- Config enters from `env.js`.
- Services perform all API communication.
- Components own page state and render logic.
- Templates decide how empty/non-empty states appear.
- Styles are split into global + per-page.
- Router controls page boundaries and lazy loading.

If you remember this path, you can debug most issues quickly:

`env -> service -> component state -> template -> style`.
