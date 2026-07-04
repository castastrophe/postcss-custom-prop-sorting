import type { Declaration, PluginCreator } from "postcss";

/**
 * A single custom-property entry passed to the `sortOrder` comparator:
 * a tuple of the property name (e.g. `"--foo"`) and its PostCSS `Declaration`.
 */
export type PropSet = [Declaration["prop"], Declaration];

export interface Options {
  /**
   * Custom comparator applied to each pair of custom properties.
   *
   * Receives two `PropSet` tuples and returns a negative number if `a` should
   * sort before `b`, positive if `a` should sort after `b`, or zero for equal.
   *
   * Defaults to a natural (numeric-aware) alphabetical sort by property name.
   */
  sortOrder?: (a: PropSet, b: PropSet) => number;
}

declare const plugin: PluginCreator<Options>;

export default plugin;
