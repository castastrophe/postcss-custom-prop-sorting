# postcss-custom-prop-sorting

## 4.0.1

### Patch Changes

- [#213](https://github.com/castastrophe/postcss-custom-prop-sorting/pull/213) [`7da84ca`](https://github.com/castastrophe/postcss-custom-prop-sorting/commit/7da84ca15286873004df8da1ee71ddc121d62374) - `index.d.ts` is now generated from the JSDoc annotations on `index.js` by `tsc`, so a single source of truth describes the plugin's public API. Consumer-visible types are unchanged in intent — `PropSet` and `Options` are still named exports and the default export is still the PostCSS `PluginCreator<Options>` — but the emitted shape carries two cosmetic differences from the previous hand-maintained file:

  - `Options` is emitted as a `type` alias rather than an `interface`. Existing `import { Options } from "postcss-custom-prop-sorting"` continues to work; declaration-merging into `Options` (rare) no longer does.
  - `sortOrder` is typed as `((a: PropSet, b: PropSet) => number) | undefined`, which is TypeScript's canonical widening for a `?` property under `strictNullChecks`.

## 4.0.0

### Major Changes

- [#210](https://github.com/castastrophe/postcss-custom-prop-sorting/pull/210) [`4f75d34`](https://github.com/castastrophe/postcss-custom-prop-sorting/commit/4f75d3458fc894e6acbb45bb390aaac7e131d11c) Thanks [@castastrophe](https://github.com/castastrophe)! - Built for design-token stylesheets: dependency-aware sorting for CSS custom properties — including nested var() fallback chains — with TypeScript types and Node 18+ / PostCSS 8 support.

  ### Breaking changes
  - **Full ESM migration.** `"type": "module"` is set in `package.json`, `module.exports` has been replaced with `export default`, and `exports` conditions are declared. CJS consumers doing `const plugin = require("postcss-custom-prop-sorting")` must switch to `import plugin from "postcss-custom-prop-sorting"` (or dynamic `await import(...)` from a CJS file).
  - **Dropped PostCSS 7 peer support.** `peerDependencies.postcss` is now `^8.4.0`. PostCSS 7 has been EOL since 2022; [PostCSS 8 migration guide](https://evilmartians.com/chronicles/postcss-8-plugin-migration).
  - **Widened supported Node range.** `engines.node` is now `>=18` (down from `>=24`). This is a compatibility _widening_ for consumers, but if you were relying on Node 24-only syntax in a downstream extension, be aware the plugin now runs on Node 18 too.

  ### Fixed
  - **Custom-property dependency reordering was inverted.** Previously, a property whose value referenced another (`--a: var(--e)`) was left ahead of its dependency instead of being moved after it. Fixed and validated by real byte-for-byte fixture assertions (previously the tests counted warnings).
  - **Multi-dependency support.** A dependent with more than one in-rule dependency (`--c: var(--x, var(--y))`) now correctly follows _all_ of its dependencies. The prior single-pass "splice + queue" approach silently lost the second constraint.
  - **Circular dependencies no longer hit a 100-iteration `console.log` fallback.** Cycles are now detected explicitly and emit a proper PostCSS warning; the remaining dependents are appended in sort order rather than looping.
  - **`var()` regex modernized.** Now handles whitespace (`var( --foo )`) and nested fallback dependencies (`var(--x, var(--y))` records deps on both `--x` and `--y`).
  - **Warnings now route through the correct API.** `decl.warn(rule, ...)` (a silent no-op — first arg should be the PostCSS `Result`) is now `decl.warn(result, ...)`. The 100-iteration `console.log` is now `rule.warn(result, ...)`.
  - **`raws.after`/`raws.before` hardened against `undefined`.** Rules containing only custom properties no longer risk producing `"undefined\n"` in output or crashing on `decl.next()`.
  - **JSDoc typedef corrected.** `sortOrder` returns `number`, not `PropSet[]`.

  ### Added
  - **TypeScript declarations.** A hand-written `index.d.ts` exports `PropSet` and `Options`. Types are wired into `package.json` via `types` and inside `exports` conditions.
  - **Comprehensive fixture coverage.** 8 new fixture/expected pairs covering nested `@media` rules, `:root`, deep dependency chains, duplicates, plain rules with no custom properties, `var()` whitespace, nested fallback dependencies, rules containing only custom properties, and circular dependencies. Test count went from 4 → 12; coverage from 89.1% → 100% statements / 100% functions.

  ### Changed
  - **Release pipeline swapped from `semantic-release` to `changesets`.** Releases are now driven by human-authored `.changeset/*.md` files aggregated into a "Version Packages" PR. GitHub Actions publishes to npm with provenance (OIDC) when that PR merges. See `.changeset/README.md` for the contributor workflow.
  - **Commitlint / conventional-commit enforcement removed.** With changesets carrying the release-note authorship, commit messages are no longer parsed to derive versions; the pre-commit hook now runs `lint-staged` instead of the full test suite.
  - **CI test matrix reworked.** Full Ava suite runs on Node 22 & 24 (Ava 8's floor). A lightweight smoke job installs only `postcss` and runs the plugin end-to-end on Node 18 & 20 to prove the widened `engines.node` claim. A Prettier check job gates formatting.
  - **README rewritten.** The API example now shows real PostCSS 8 syntax (`postcss([plugin]).process(...)` instead of the fictitious `postcss.process([plugin])`), the Contributing link points at the correct repo, and a new "Dependency handling" section documents the topological reorder semantics and cycle-warning behavior.

## 3.0.0

### Breaking changes

- `engines.node` raised from `>=20` to `>=24` ([#151](https://github.com/castastrophe/postcss-custom-prop-sorting/pull/151)). No plugin behavior, API, or peer-dependency changes relative to `2.1.0`.
