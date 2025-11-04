/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const fs = require("fs");
const test = require("ava");
const postcss = require("postcss");
const plugin = require("./index.js");

function compare(t, fixtureFilePath, expectedFilePath, options = {}) {
  return postcss([plugin(options)])
    .process(readFile(`./fixtures/${fixtureFilePath}`), {
      from: fixtureFilePath,
    })
    .then((result) => {
      const expected = readFile(`./expected/${expectedFilePath}`);
      // t.is(result.css, expected);
      return result;
    });
}

function readFile(filename) {
  return fs.readFileSync(filename, "utf8");
}

test("create basic output", (t) => {
  return compare(t, "basic.css", "basic.css").then((result) => {
    t.is(result.warnings().length, 0);
  });
});

test("validate a complex output", (t) => {
  return compare(t, "complex.css", "basic.css").then((result) => {
    fs.writeFileSync("./expected/complex.css", result.css);
    t.is(result.warnings().length, 0);
  });
});

test("create a custom sort output", (t) => {
  return compare(t, "basic.css", "custom-sort.css", {
    sortOrder: ([, aDecl], [, bDecl]) => {
      /* Sort alphabetical by value. */
      return aDecl.value > bDecl.value ? 1 : -1;
    },
  }).then((result) => {
    t.is(result.warnings().length, 0);
  });
});

test("warn if the sortOrder provided is not a function", (t) => {
  return compare(t, "basic.css", "basic.css", {
    sortOrder: "alphabetical",
  }).then((result) => {
    t.is(result.warnings().length, 1);
  });
});
