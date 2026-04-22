# Architecture Guide

## Canonical Routing

- `/category` and `/category/[slug]` are the canonical product-category routes.
- `/categories` and `/categories/[fishName]` are fish-directory routes.
- Legacy typo route `/catagory` is redirected in `next.config.js`.
- Legacy mobile route `/categoriesmobile` is redirected in `next.config.js`.

## Folder Conventions

- `src/app`: route entrypoints only.
- `src/components/maps`: canonical map components used by route and flow UI.
- `src/components/map`: legacy map implementations kept for compatibility.
- `src/lib`: shared app logic and helpers used by services/routes/components.
- `src/services`: integration logic (geocoding, content, auth, tracking).
- `src/utils`: focused utility helpers that do not duplicate lib/service responsibilities.

## Cleanup Rules

- Do not add `*.new`, `*.bak`, `*.backup`, or ad-hoc `test-page` route files.
- Keep one active implementation per route entrypoint (`page.tsx`).
- Keep backward compatibility through redirects, not duplicate routes.

## Refactor Checklist

1. Add or update route in `src/app`.
2. Keep shared UI in `src/components` and avoid route-local duplicates.
3. If replacing a route implementation, update `page.tsx` directly.
4. Remove obsolete files in the same PR.
5. Run `npm run build` before merge.
