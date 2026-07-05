---
"postcss-custom-prop-sorting": major
---

Republish the design-token modernization work under `4.0.0`. This is the release originally cut as `3.0.0` by the migrated changesets pipeline; because `postcss-custom-prop-sorting@3.0.0` had already been published on npm by the previous `semantic-release` pipeline for the Node 24 requirement bump ([#151](https://github.com/castastrophe/postcss-custom-prop-sorting/pull/151)), that publish silently no-op'd and never reached the registry. Bumping to `4.0.0` skips the collision so the release can go out.

Consumers upgrading from any previously-published version (`1.x`, `2.x`, or npm's `3.0.0`) to `4.0.0` should follow the full "Breaking changes" list in the `3.0.0` entry below — this changeset does not add new breaking changes on top of it; it only relabels the same release as `4.0.0`.
