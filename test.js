/*
Copyright 2025 Adobe. All rights reserved.
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "ava";
import postcss from "postcss";
import plugin from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readFixture = (name) =>
  fs.readFileSync(path.join(__dirname, "fixtures", name), "utf8");
const readExpected = (name) =>
  fs.readFileSync(path.join(__dirname, "expected", name), "utf8");

async function run(fixtureFile, options = {}) {
  return postcss([plugin(options)]).process(readFixture(fixtureFile), {
    from: fixtureFile,
  });
}

test("basic input is sorted and dependencies preserved", async (t) => {
  const result = await run("basic.css");
  t.is(result.css, readExpected("basic.css"));
  t.is(result.warnings().length, 0);
});

test("complex input matches expected output", async (t) => {
  const result = await run("complex.css");
  t.is(result.css, readExpected("complex.css"));
  t.is(result.warnings().length, 0);
});

test("custom sortOrder function is applied", async (t) => {
  const result = await run("basic.css", {
    sortOrder: ([, aDecl], [, bDecl]) => (aDecl.value > bDecl.value ? 1 : -1),
  });
  t.is(result.css, readExpected("custom-sort.css"));
  t.is(result.warnings().length, 0);
});

test("non-function sortOrder emits a warning and falls back to default", async (t) => {
  const result = await run("basic.css", { sortOrder: "alphabetical" });
  t.is(result.css, readExpected("basic.css"));
  t.is(result.warnings().length, 1);
});

test("visits rules nested inside @media", async (t) => {
  const result = await run("nested-at-rule.css");
  t.is(result.css, readExpected("nested-at-rule.css"));
  t.is(result.warnings().length, 0);
});

test("sorts within :root", async (t) => {
  const result = await run("root.css");
  t.is(result.css, readExpected("root.css"));
  t.is(result.warnings().length, 0);
});

test("resolves a deep dependency chain", async (t) => {
  const result = await run("chain.css");
  t.is(result.css, readExpected("chain.css"));
  t.is(result.warnings().length, 0);
});

test("emits a warning for duplicate custom properties and keeps the last", async (t) => {
  const result = await run("duplicates.css");
  t.is(result.css, readExpected("duplicates.css"));
  const warnings = result.warnings();
  t.is(warnings.length, 1);
  t.regex(warnings[0].text, /duplicate/i);
});

test("leaves a rule with no custom properties untouched", async (t) => {
  const result = await run("plain.css");
  t.is(result.css, readExpected("plain.css"));
  t.is(result.warnings().length, 0);
});

test("handles var() whitespace and nested fallback dependencies", async (t) => {
  const result = await run("fallback-deps.css");
  t.is(result.css, readExpected("fallback-deps.css"));
  t.is(result.warnings().length, 0);
});

test("does not crash when a rule has only custom properties", async (t) => {
  const result = await run("only-custom-props.css");
  t.is(result.css, readExpected("only-custom-props.css"));
  t.is(result.warnings().length, 0);
});

test("warns and does not infinite-loop on a circular dependency", async (t) => {
  const result = await run("cycle.css");
  t.is(result.css, readExpected("cycle.css"));
  const warnings = result.warnings();
  t.is(warnings.length, 1);
  t.regex(warnings[0].text, /circular/i);
});
