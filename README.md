# postcss-custom-prop-sorting
>
> Bring together all custom properties at the top of a set of rules and sort them by a provided
> sorting function (defaults to alphabetical).

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
  --e: var(--a);
  --b: rgba(255, 255, 255, 0.8);
  --d: block;
  --a: #fff;
  --c: 10px;
}
```

Into this:

```css
.lightest {
  --a: #fff;
  --b: rgba(255, 255, 255, 0.8);
  --c: 10px;
  --d: block;
  --e: var(--a);
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
  --a: #fff;
  --c: 10px;
  --d: block;
  --b: rgba(255, 255, 255, 0.8);
  --e: var(--a);
}
```

You could use this to sort custom properties for example by type, parsing values by leveraging the [postcss-value-parser](https://github.com/TrySound/postcss-value-parser).

or implement a manual logic similar to how the [css-declaration-sorter](https://github.com/Siilwyn/css-declaration-sorter/blob/master/orders/smacss.mjs) project does and define your logic manually.

## Options

### `sortOrder`

Type: `([string, Declaration], [string, Declaration]) => Number`<br>
Default: `([a,], [b,]) => (a > b ? 1 : -1),`

A function to be passed to the array sort method.  It is passed two arrays, each containing the property name (including the `--` prefix) and the corresponding Declaration object.  The function should return a number, where a negative number indicates that the first item should be sorted before the second item, a positive number indicates that the second item should be sorted before the first item, and zero indicates that the items are equal.
