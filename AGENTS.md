# Mingu UI — agent guide

## Start here

This repository is the source of Mingu's shared React design system and the standalone catalog at https://ui.mingu.xyz. The package root is this directory; no blog checkout or sibling workspace is required.

Read these files before changing UI:

1. `DESIGN_SYSTEM.md` — tokens, themes, public APIs, accessibility and integration rules.
2. `COMPONENTS.md` — component inventory and states.
3. `package.json` — public exports and available commands.

Use existing components and semantic tokens first. Keep product APIs, authentication and business rules in consuming applications.

## Source map

| Change | Location |
| --- | --- |
| Shared colors, spacing, typography, motion | `packages/tokens/src/index.ts`, `scripts/sync-tokens.mjs` → `tokens.css` |
| React Native core, APIs and app example | `packages/native/src`, `NATIVE.md`, `examples/native/` (standalone Expo app) |
| Core component styles | `system.css` |
| Shared field labels, descriptions and input slots | `src/system/field-frame.tsx` |
| Core controls, forms, display, navigation, overlays | `src/system/` |
| Button, copy, floating field, segmented and card interactions | `src/system/micro-interactions.tsx` |
| Shared spring settings | `src/system/motion-tokens.ts` |
| Interaction components and reading utilities | `src/*.tsx`, `src/useReadingPosition.ts` |
| Lab, navigation, media, tools, AI, creative, workflow and kinetic collections | `src/collections/*.{tsx,css,catalog.ts}`, `docs/collections/*.md` |
| Interaction styles | `styles.css`, `interaction.css` |
| Public exports | `src/index.ts`, `src/system/index.tsx`, `package.json` |
| Unified catalog metadata | `src/system/ui-catalog.ts` |
| Core / interaction inventory | `src/system/catalog.ts`, `src/system/interaction-catalog.ts` |
| Landing and live token workbench | `docs/src/LandingPage.tsx`, `docs/src/LandingWorkbench.tsx`, `docs/src/landing.css` |
| Client routes and lazy page loading | `docs/src/App.tsx` |
| Catalog shell, search, navigation and theme | `docs/src/UiCatalog.tsx` |
| Interactive control/state workbench | `docs/src/ControlWorkbench.tsx` |
| Live examples | `docs/src/SystemComponentDemo.tsx`, `docs/src/DemoPreview.tsx`, other preview files |
| Full-screen experimental playground | `docs/src/ExperimentalPlayground.tsx`, `src/experimental/canvas.ts` |
| Catalog routes | `docs/src/main.tsx`, `docs/src/routing.tsx` |
| Catalog styles | `docs/src/system-catalog.css`, `docs/src/site.css` |
| Static build / HTTP server | `docs/build.mjs`, `docs/server.mjs` |
| Consumer integration examples | `examples/` |

Inspect existing implementations near the change before adding a new abstraction. `dist/` and `docs/routes.mjs` are generated; change their source files instead.

## Component changes

- Keep `@mingu/interaction-ui` and existing public exports compatible. Consumers transpile TypeScript source and import CSS explicitly.
- Preserve native props, refs, form behavior, keyboard navigation, focus-visible, disabled and error states. Every input needs an accessible name.
- Use semantic tokens rather than scattering new colors, spacing or motion constants across files. Keep themes scoped to the provider.
- Default screens should remain calm and readable. Larger interactions are opt-in; respect reduced motion and touch input.
- Reuse the same implementation in the package and catalog. Demos must show real component behavior.
- For a new component, set `addedAt: "YYYY-MM-DD"` to its actual UTC release date in catalog metadata. New badges automatically expire after 30 days; do not renew dates on unrelated redeploys. The legacy ID fixture exempts older undated entries and must not be extended for new components.
- For a new component, update the appropriate exports, catalog metadata, live preview and API documentation together. Check the unified catalog before registering a duplicate. Collection metadata lives alongside the implementation and is composed into `src/system/interaction-catalog.ts`; collection CSS is imported by `styles.css`. Keep the live preview dispatcher and its browser fixture connected to the same implementation.
- Document breaking API changes and migration steps; do not silently rename or remove exports.

## Local commands

Use the Node/npm versions declared in `package.json`.

```sh
npm ci
npm run typecheck
npm run typecheck:docs
npm run build
npm start
```

`npm start` serves the built catalog on `PORT` (default 3000). Rebuild after editing; this server does not provide hot reload.

Run checks relevant to the change:

- Package/API change: `npm run typecheck`; collection exports also run `npm run test:ssr` (classic JSX, no browser globals).
- Catalog change: `npm run typecheck:docs` and `npm run build`; inspect affected pages on desktop and mobile.
- Interaction/accessibility change: `npm run test:browser`. Install the browser with `npx playwright install chromium`, or use `PLAYWRIGHT_CHANNEL=chrome npm run test:browser` with installed Chrome.
- Build, routing or server change: `npm run test:docs` (builds and tests the HTTP server).
- Documentation-only change: check referenced paths, commands and `git diff --check`; a full browser suite is unnecessary.

Report checks actually run and any unverified behavior. Do not claim deployment success from a successful push alone.

## Deployment and consumers

Railway deploys the catalog from this repository's root using `railpack.json`: build `npm run build`, start `npm start`, health check `/healthz`, bind `0.0.0.0:$PORT`.

The gallery is `/all`, documentation is `/docs` and `/docs/<id>`, and root component routes such as `/button` remain compatible; `/lab/ui/...` is a legacy redirect. Use https://ui.mingu.xyz for public catalog links.

A consuming app can pin this repository as a Git dependency or submodule. A catalog-only change does not require updating a consumer's package pin. Component adoption and consumer deployment are separate changes; do not edit a consumer checkout as a side effect.

## Native changes

Read NATIVE.md before editing mobile UI. Keep Native imports inside the explicit `/native` entry, independent of the DOM/CSS/web exports. Shared primitive values come from `packages/tokens/src/index.ts`; run `tokens:sync` after changing them and keep `tokens:check` passing. Preserve optional peer dependencies so web consumers do not need Native modules. For Native changes run `typecheck`, `test:native`, and `build`; the strict Native consumer test must compile the complete example without DOM libraries. Node tests mock OS boundaries and cannot be described as device verification. Catalog-only Native inventory belongs in `packages/native/catalog.ts`, separate from the 200 web entries.

The Expo example owns its dependencies and lockfile. Run `npm ci`, `npm run typecheck`, `npx expo install --check` and `npm run export:check` in `examples/native` after changing its setup. Keep Metro runtime resolution inside that app; root Web development may use a different React patch version. Do not add Expo to root dependencies or the Railway build. Platform exports verify Metro bundling, not actual device behavior.
