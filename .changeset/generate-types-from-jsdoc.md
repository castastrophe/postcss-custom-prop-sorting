---
"postcss-custom-prop-sorting": patch
---

`index.d.ts` is now generated from the JSDoc annotations on `index.js` by `tsc`, so a single source of truth describes the plugin's public API. Consumer-visible types are unchanged in intent — `PropSet` and `Options` are still named exports and the default export is still the PostCSS `PluginCreator<Options>` — but the emitted shape carries two cosmetic differences from the previous hand-maintained file:

- `Options` is emitted as a `type` alias rather than an `interface`. Existing `import { Options } from "postcss-custom-prop-sorting"` continues to work; declaration-merging into `Options` (rare) no longer does.
- `sortOrder` is typed as `((a: PropSet, b: PropSet) => number) | undefined`, which is TypeScript's canonical widening for a `?` property under `strictNullChecks`.
