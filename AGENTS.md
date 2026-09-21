# postcss-custom-prop-sorting

A PostCSS plugin that hoists custom properties to the top of a declaration block and
sorts them dependency-aware, so a property that references another comes after it.
The whole plugin is `index.js`; `index.d.ts` is generated from its JSDoc.

ESM only, Node >= 18, Yarn 4. `postcss` is a peer dependency: never move it to
`dependencies`.

## Commands

```sh
yarn test      # ava
yarn lint      # prettier --check
yarn types     # tsc, regenerates index.d.ts from JSDoc
yarn coverage  # c8 over the test suite
```

Run `yarn test` and `yarn lint` before calling any change to `index.js` or
`index.d.ts` done. "Should work" is not sufficient: the suite is fast.

## Types

`index.d.ts` is generated, never hand-edited. When the plugin factory signature, the
`Options` shape, or the return type changes, update the JSDoc on `index.js`; the
pre-commit hook runs `yarn types` and re-stages the refreshed file, and CI's lint job
fails when the committed file drifts from what the JSDoc emits. If the hook was
bypassed with `--no-verify`, run `yarn types` by hand and commit the result alongside
the JSDoc change.

## Test pattern

Tests are fixture / expected pairs: `CONTRIBUTING.md` → "Adding a test" has the
recipe. Every test asserts **both**:

- `t.is(result.css, readExpected("<name>.css"))`
- `t.is(result.warnings().length, N)`: with a `t.regex` on the warning text when
  `N > 0`

Skipping the warnings assertion lets regressions through silently. It is the most
common mistake in this repo.

## Ask before changing

These turn a small change into a breaking release. Flag them and let the maintainer
decide before implementing, even when the edit looks trivial:

- the exported plugin factory signature or the `Options` shape
- the default `sortOrder` behavior
- `peerDependencies` (currently `postcss ^8.4.0`)
- `engines.node` in `package.json`
- the `.nvmrc` pin

## Contributing flow

`CONTRIBUTING.md` is the source of truth for branch naming, the changeset bump
policy, and the peer-dependency versioning rules: follow it rather than a separate
set of rules here. Two things worth restating:

- Fill in the sections of `.github/PULL_REQUEST_TEMPLATE.md`. Delete a section that
  genuinely doesn't apply rather than padding it with "n/a".
- A changeset body ships to consumers as the CHANGELOG entry, so it is release notes,
  not a commit message: full sentences, addressed to the upgrader ("`sortOrder` now
  receives …"), with inline `code` for symbols and options.

## Attribution

Commits and PR bodies end where the human-authored content ends. No `Co-Authored-By`
trailers, no `Claude-Session:` or other session-URL lines, no "Generated with …"
footers in any form, and no `claude.ai` URLs. If a tool appends one after the fact,
edit it back out.

## Prose style

Prose in this repo (README, commit bodies, PR descriptions) follows the
[style guide](https://github.com/castastrophe/.github/blob/main/AGENTS.md#style-guide):
sentence-case headings, `&` over "and", `:` over em dashes.
