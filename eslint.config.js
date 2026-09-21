import markdown from "@eslint/markdown";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  // CHANGELOG.md is owned by Changesets, which rewrites it on every release.
  // .yarn/ holds the vendored Yarn binary.
  globalIgnores(["CHANGELOG.md", ".yarn/**"]),
  {
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
  },
]);
