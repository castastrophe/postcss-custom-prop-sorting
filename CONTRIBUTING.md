# Contributing to postcss-custom-prop-sorting

First off — thank you! 🎉 _Allons-y_ means "let's go," and we're glad you're
going there with us. This guide explains how to contribute to this project.

## Code of Conduct

This project and everyone participating in it is governed by our
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to
uphold it. Please report unacceptable behavior to **report@allons-y.studio**.

## Ways to contribute

You don't have to write code to make a difference:

- 🐛 **Report bugs** — open an issue with clear reproduction steps.
- ✨ **Suggest features** — tell us about the problem you're trying to solve.
- 📚 **Improve docs** — typos, clarifications, and examples are always welcome.
- 🧪 **Triage issues** — reproduce reports, confirm bugs, suggest labels.
- 💬 **Help others** — answer questions in Discussions.

## Reporting bugs & requesting features

Please use our [issue templates](https://github.com/castastrophe/postcss-custom-prop-sorting/issues/new/choose).
Before opening a new issue, search existing ones to avoid duplicates.

## Project layout

The whole plugin is a single file, so there isn't much to navigate:

- `index.js` — the plugin implementation, and the source of truth
  for the public TypeScript types (via its JSDoc annotations).
- `index.d.ts` — the public TypeScript types. **Generated** — don't
  hand-edit. `tsc` emits this from the JSDoc on `index.js`; see
  `tsconfig.json`. Update the JSDoc annotations and the pre-commit
  hook (or `yarn types`) refreshes the file.
- `fixtures/` — input CSS for tests (one file per case).
- `expected/` — the expected output for each fixture, matched by filename.
- `test.js` — the AVA test harness that runs each fixture through the
  plugin and compares against `expected/`.
- `.changeset/` — pending changesets waiting to be released.

## How the plugin works

At a high level, for every rule the plugin splits declarations into
**custom properties** and **everything else**, then splits the custom
properties again into **independents** (no `var(--x)` references to
sibling custom properties in the same rule) and **dependents** (they do
reference a sibling). Independents are sorted with `sortOrder`
(alphanumeric by default). Dependents are appended after them and
topologically ordered so each one still follows all of its in-rule
dependencies. Cycles trigger a PostCSS warning and get flushed in sort
order rather than looping. Start in `index.js` at the `Rule` visitor.

## Development workflow

### Prerequisites

- **Node.js** — this project uses [nvm](https://github.com/nvm-sh/nvm)
  for Node version management. Run `nvm use` in the repo root to pick
  up the version pinned in `.nvmrc` (install it with `nvm install`
  first if you don't have it). Consumers only need Node `>=18` (see
  `engines.node`), but the dev-tooling floor is higher — AVA 8
  requires `^22.20 || ^24.12 || >=26` — and `.nvmrc` reflects that.
- **Yarn 4 via Corepack** — this project uses Yarn 4. Run
  `corepack enable` once so `yarn` resolves to the pinned version in
  `package.json`. CI uses `yarn install --immutable`; run the same
  locally if you want lockfile parity.

### Steps

1. **Fork** the repository and clone your fork.
2. **Install** dependencies with `yarn install`.
3. **Create a branch** from `main` using a descriptive name:
   - `fix/short-description` for bug fixes
   - `feat/short-description` for features
   - `docs/short-description` for documentation
4. **Make your changes** in small, focused commits.
5. **Test** your changes locally with `yarn test` and add tests where
   appropriate (see below). `yarn coverage` produces a coverage report.
6. **Lint and format** with `yarn lint` (or `yarn format` to auto-fix)
   before committing.
7. **Add a changeset** for any user-facing change: `yarn changeset`.
8. **Open a pull request** against `main` and fill out the PR template.

### Writing a changeset

`yarn changeset` will add a new markdown file in `.changeset/`. The body
of that file becomes the CHANGELOG entry that ships to consumers, so
treat it like release notes:

- Write full sentences with punctuation; no commit-message shorthand or sentence fragments.
- Address the reader (the person upgrading), not the reviewer. Lead
  with the observable behavior change.
- Use markdown formatting best practices such as: inline `code` for symbols and options, links for
  issues/PRs, and lists when there's more than one item.

### Adding a test

Tests are AVA-driven and follow a fixture / expected pair pattern:

1. Add the input CSS at `fixtures/<name>.css`.
2. Add the expected output at `expected/<name>.css` (byte-for-byte —
   the assertion is `t.is(result.css, expected)`).
3. Add a `test(...)` block in `test.js` that calls `run("<name>.css")`
   and asserts on both `result.css` and `result.warnings()`.

If a case is expected to emit a warning, assert `warnings.length === 1`
and match the warning text with `t.regex`.

### Commit messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```md
type(scope): short summary

[optional body]
[optional footer]
```

Common types:

| Type       | When to use                                 |
| ---------- | ------------------------------------------- |
| `feat`     | A new feature (triggers a minor release)    |
| `fix`      | A bug fix (triggers a patch release)        |
| `docs`     | Documentation changes only                  |
| `test`     | Adding or updating tests                    |
| `refactor` | Code restructuring without behaviour change |
| `chore`    | Tooling, config, dependency updates         |

A `BREAKING CHANGE:` footer or a `!` after the type (e.g. `feat!:`) triggers a major release.

### Pull request guidelines

- Keep PRs focused — one logical change per PR is easiest to review.
- Reference the issue your PR addresses (`Closes #123`).
- Make sure CI passes and there are no new PostCSS warnings.
- Be responsive to review feedback — we aim to be too.

## Peer dependency and versioning policy

The plugin peers on `postcss ^8.4.0`. Raising that floor — or any change
to the exported plugin factory signature, the `Options` shape, or the
default sort order — is a **breaking change** `major`. Adding new options with safe defaults is a `minor`. Bug
fixes and internal refactors are `patch`.

## Release process

Releases are automated via [Changesets](https://github.com/changesets/changesets).
When a PR that includes a changeset merges to `main`, the release
workflow opens/updates a PR (bundling all
pending changesets into a version bump + CHANGELOG entry). If that
PR is the one being merged, CI will publish the new version to npm with
provenance. Contributors don't cut releases directly, those steps are handled by the maintainers.

## License

Contributions are accepted under this project's [Mozilla Public License 2.0](LICENSE).
By submitting a contribution, you agree that it may be distributed under those
terms.

## Questions?

Open a [discussion](https://github.com/castastrophe/postcss-custom-prop-sorting/discussions).
Thanks again for contributing! 💜
