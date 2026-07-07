/*!
 * Copyright 2025. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * A single custom-property entry passed to the `sortOrder` comparator:
 * a tuple of the property name (e.g. `"--foo"`) and its PostCSS `Declaration`.
 *
 * @typedef {[import('postcss').Declaration["prop"], import('postcss').Declaration]} PropSet
 */

/**
 * @typedef {object} Options
 * @property {(a: PropSet, b: PropSet) => number} [sortOrder]
 *   Custom comparator applied to each pair of custom properties.
 *
 *   Receives two `PropSet` tuples and returns a negative number if `a` should
 *   sort before `b`, positive if `a` should sort after `b`, or zero for equal.
 *
 *   Defaults to a natural (numeric-aware) alphabetical sort by property name.
 */

const messages = {
  sortOrderMustBeFunction: () =>
    "The sort order input must be provided as a function. The custom properties will be sorted alphanumerically by default.",
};

/** @type {import('postcss').PluginCreator<Options>} */
const plugin = ({
  /* Defaults to sorting alphabetically. */
  sortOrder,
} = {}) => {
  // Sort the custom properties alphabetically and then numerically
  /** @type {(a: PropSet, b: PropSet) => number} */
  const alphaNumericSort = ([a], [b]) => {
    // Sort the values in alphabetical order first and then
    // sort the numbers in numerical order assuming no leading zeros
    // Example: ["a1", "a2", "a10", "a11", "a20", "a21", "a100", "b1", "b2"]
    return a.localeCompare(b, undefined, { numeric: true });
  };

  return {
    postcssPlugin: "postcss-custom-prop-sorting",
    Rule(rule, { result }) {
      /** Create a map to store the custom properties. */
      /** @type Map<import('postcss').Declaration["prop"], import('postcss').Declaration> */
      const customProps = new Map();
      /** @type Map<import('postcss').Declaration["prop"], Set<import('postcss').Declaration["prop"]>> */
      const dependencies = new Map();

      /* Sort the custom properties in the order specified without re-ordering properties that rely on others */
      rule.walkDecls(/^--/, (decl) => {
        const { prop } = decl;

        /* If the property is already in the map throw a warning. */
        if (customProps.has(prop)) {
          decl.warn(
            result,
            `Duplicate custom property found: ${prop}. Only the last declaration will be kept.`,
            { word: prop },
          );

          // Remove the property from the map so that the last declaration is kept
          customProps.delete(prop);
        }

        // Extract every custom property referenced inside var() in the value.
        // Handles whitespace (`var( --foo )`) and nested fallback deps
        // (`var(--x, var(--y))` yields both --x and --y).
        for (const [, depName] of decl.value.matchAll(
          /var\(\s*(--[^\s,)]+)/g,
        )) {
          let dependents = dependencies.get(depName);
          if (!dependents) dependencies.set(depName, (dependents = new Set()));
          dependents.add(prop);
        }

        /**
         * Add the property to the map; note that duplicates replace the existing
         *  item b/c we want to retain the last declaration of the property.
         **/
        customProps.set(prop, decl);

        /** Remove properties so that we can append them in the correct order. */
        decl.remove();
      });

      /** Iterate over the custom properties in the map and append them to the rule. */
      /** @type PropSet[] */
      const sortedArray = [...customProps.entries()];
      if (typeof sortOrder === "function") sortedArray.sort(sortOrder);
      else {
        if (typeof sortOrder !== "undefined") {
          rule.warn(result, messages.sortOrderMustBeFunction(), {
            word: "sortOrder",
          });
        }

        sortedArray.sort(alphaNumericSort);
      }

      // Invert the dependency map: dependent -> Set of its dependencies that
      // are actually present in this rule (out-of-rule deps don't constrain
      // ordering inside this rule).
      const propNames = new Set(sortedArray.map(([p]) => p));
      /** @type Map<import('postcss').Declaration["prop"], Set<import('postcss').Declaration["prop"]>> */
      const dependenciesOf = new Map();
      for (const [dep, dependents] of dependencies) {
        if (!propNames.has(dep)) continue;
        for (const dependent of dependents) {
          if (!propNames.has(dependent)) continue;
          let deps = dependenciesOf.get(dependent);
          if (!deps) dependenciesOf.set(dependent, (deps = new Set()));
          deps.add(dep);
        }
      }

      // Partition: independents keep their sorted position; dependents get
      // topologically ordered at the end so each dependent follows all its
      // in-rule dependencies. Ties within the dependents partition break by
      // the user-provided sort (already applied to sortedArray).
      const independents = sortedArray.filter(([p]) => !dependenciesOf.has(p));
      const dependentsPending = sortedArray.filter(([p]) =>
        dependenciesOf.has(p),
      );

      /** @type PropSet[] */
      const dependentsOrdered = [];
      const placed = new Set(independents.map(([p]) => p));

      while (dependentsPending.length > 0) {
        const idx = dependentsPending.findIndex(([p]) => {
          // `p` is only in `dependentsPending` because the partition above
          // filtered on `dependenciesOf.has(p)`, so the entry is present —
          // but TS can't carry that narrowing across the callback.
          const deps =
            /** @type {Set<import('postcss').Declaration["prop"]>} */ (
              dependenciesOf.get(p)
            );
          return [...deps].every((d) => placed.has(d));
        });
        if (idx === -1) {
          // Every remaining dependent still has an unresolved dep in this set
          // — that means a cycle. Append the rest in their current sort order.
          rule.warn(
            result,
            `Circular custom-property dependency detected; appending ${dependentsPending.length} remaining custom propert${dependentsPending.length === 1 ? "y" : "ies"} in sort order.`,
          );
          dependentsOrdered.push(...dependentsPending);
          dependentsPending.length = 0;
          break;
        }
        const [entry] = dependentsPending.splice(idx, 1);
        dependentsOrdered.push(entry);
        placed.add(entry[0]);
      }

      sortedArray.length = 0;
      sortedArray.push(...independents, ...dependentsOrdered);

      // Snapshot whether the rule has any non-custom-property nodes remaining.
      // (walkDecls above removed every custom prop, so rule.nodes now holds
      // only the "other" declarations.) If it does, insert a blank line
      // between the last custom prop and the first other decl.
      const ruleHasOtherDecls = rule.nodes.length > 0;

      sortedArray.reverse().forEach(([, decl], idx) => {
        const isLastCustomProp = idx === 0;

        if (isLastCustomProp && ruleHasOtherDecls) {
          decl.raws.after = (decl.raws.after ?? "") + "\n";
        }

        rule.prepend(decl);

        if (isLastCustomProp && ruleHasOtherDecls) {
          const next = decl.next();
          if (next) {
            next.raws.before = `\n${next.raws.before ?? ""}`;
          }
        }
      });
    },
  };
};

plugin.postcss = true;

export default plugin;
