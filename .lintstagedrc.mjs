export default {
  "*.js": "prettier --write",
  "package.json": "prettier-package-json --write",
  // When index.js changes, regenerate index.d.ts from its JSDoc and
  // re-stage the refreshed types file so it lands in the same commit.
  // Returning a fixed command tells lint-staged not to append filenames.
  "index.js": () => ["yarn types", "git add index.d.ts"],
};
