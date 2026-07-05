# postcss-custom-prop-sorting

> Built for design-token stylesheets: dependency-aware sorting for CSS custom properties — including nested `var()` fallback chains — with TypeScript types and Node 18+ / PostCSS 8 support.

## Installation

```sh
yarn add -D postcss-custom-prop-sorting
```

## Usage

```sh
postcss -u postcss-custom-prop-sorting -o dist/index.css src/index.css
```

This plugin turns this:

```css
.lightest {
  text-transform: capitalize;
  --a: var(--e);
  color: var(--e);
  --b3: rgba(255, 255, 255, 0.8);
  --b10: rgba(255, 255, 255, 0.3);
  --b200: rgba(255, 255, 255, 0.5);
  --d: block;
  display: var(--d);
  --e: #fff;
  --c: 10px;
  font-size: var(--c, 18px);
}
```

Into this:

```css
.lightest {
  --b3: rgba(255, 255, 255, 0.8);
  --b10: rgba(255, 255, 255, 0.3);
  --b200: rgba(255, 255, 255, 0.5);
  --c: 10px;
  --d: block;
  --e: #fff;
  --a: var(--e);

  text-transform: capitalize;
  color: var(--e);
  display: var(--d);
  font-size: var(--c, 18px);
}
```

You can optionally provide your own custom sorting logic that is keyed on either the property name or any value available in the Declaration object. The example below shows an alphabetizing logic based on the values.

```js
import postcss from "postcss";
import customPropSorting from "postcss-custom-prop-sorting";

const result = await postcss([
  customPropSorting({
    sortOrder: ([aProp, aDecl], [bProp, bDecl]) => {
      /* Sort by value. */
      return aDecl.value > bDecl.value ? 1 : -1;
    },
  }),
]).process(inputCss, { from: "input.css" });
```

Running this against the same input above, we would now get:

```css
.lightest {
  --e: #fff;
  --c: 10px;
  --d: block;
  --b10: rgba(255, 255, 255, 0.3);
  --b200: rgba(255, 255, 255, 0.5);
  --b3: rgba(255, 255, 255, 0.8);
  --a: var(--e);

  text-transform: capitalize;
  color: var(--e);
  display: var(--d);
  font-size: var(--c, 18px);
}
```

You could use this to sort custom properties for example by type, parsing values by leveraging the [postcss-value-parser](https://github.com/TrySound/postcss-value-parser).

or implement a manual logic similar to how the [css-declaration-sorter](https://github.com/Siilwyn/css-declaration-sorter/blob/master/orders/smacss.mjs) project does and define your logic manually.

### Dependency handling

Any custom property whose value references another custom property in the same rule (via `var(--other)`, including nested fallbacks like `var(--x, var(--y))`) is a **dependent**. Dependents are set aside from the primary sort and appended after every independent property, then topologically ordered among themselves so that each one still follows all of its in-rule dependencies. Ties within the dependents section are broken using the sort function (default: natural alphanumeric).

If a genuine cycle is detected (e.g. `--a: var(--b); --b: var(--a);`), the plugin emits a PostCSS warning and appends the remaining dependents in sort order rather than looping forever.

## Options

### `sortOrder`

Type: `([string, Declaration], [string, Declaration]) => Number`<br>
Default: `([a], [b]) => a.localeCompare(b, undefined, { numeric: true }),`

A custom function can be passed to the array sort method. That function will receive two arrays, each containing the property name (including the `--` prefix) and the corresponding Declaration object. The function should return a number, where a negative number indicates that the first item should be sorted before the second, a positive number indicates that the second item should be sorted before the first, and zero indicates that the items are equal.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, test recipe, and release process, or open an [issue](https://github.com/castastrophe/postcss-custom-prop-sorting/issues/new) if you're not sure where to start.

> `index.d.ts` is generated from the JSDoc on `index.js` by `tsc` — don't hand-edit it. Update the JSDoc and let `yarn types` (or the pre-commit hook) refresh the types file.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details. This means you can use this however you like as long as you provide attribution back to this one. It's nice to share but it's also nice to get credit for your work. 😉

## Funding ☕️

If you find this plugin useful and would like to buy me a coffee/beer as a small thank you, I would greatly appreciate it! Funding links are available in the GitHub UI for this repo.

<a href="https://www.buymeacoffee.com/castastrophe" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
