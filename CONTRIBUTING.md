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

## Development workflow

1. **Fork** the repository and clone your fork.
2. **Install** dependencies with `yarn install`.
3. **Create a branch** from `main` using a descriptive name:
   - `fix/short-description` for bug fixes
   - `feat/short-description` for features
   - `docs/short-description` for documentation
4. **Make your changes** in small, focused commits.
5. **Test** your changes locally with `yarn test` and add tests where
   appropriate. `yarn coverage` produces a coverage report.
6. **Lint and format** with `yarn lint` (or `yarn format` to auto-fix)
   before committing.
7. **Add a changeset** for any user-facing change: `yarn changeset`.
8. **Open a pull request** against `main` and fill out the PR template.

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

## License

Contributions are accepted under this project's [Apache 2.0 license](LICENSE).
By submitting a contribution, you agree that it may be distributed under those
terms.

## Questions?

Open a [discussion](https://github.com/castastrophe/postcss-custom-prop-sorting/discussions).
Thanks again for contributing! 💜
