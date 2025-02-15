# postcss-custom-prop-sorting
>
> Bring together all custom properties at the top of a set of rules and sort them by a provided
> sorting function (defaults to alphanumeric).

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

You can optionally provide your own custom sorting logic that is keyed on either the property name or any value available in the Declaration object.  The example below shows an alphabetizing logic based on the values.

```js
  postcss.process([
    require("postcss-custom-prop-sorting")({
      sortOrder: ([aProp, aDecl], [bProp, bDecl]) => {
        /* Sort by value. */
        const aValue = aDecl.value;
        const bValue = bDecl.value;
        return (aValue > bValue ? 1 : -1);
      },
    })
  ])
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

Important note, if custom properties have internal dependencies to other custom properties in the same rule, those dependencies will not be sorted, rather, they will be injected at the end of the list so as not to alter their resolutions.

## Options

### `sortOrder`

Type: `([string, Declaration], [string, Declaration]) => Number`<br>
Default: `([a], [b]) => a.localeCompare(b, undefined, { numeric: true }),`

A custom function can be passed to the array sort method.  That function will receive two arrays, each containing the property name (including the `--` prefix) and the corresponding Declaration object.  The function should return a number, where a negative number indicates that the first item should be sorted before the second, a positive number indicates that the second item should be sorted before the first, and zero indicates that the items are equal.
