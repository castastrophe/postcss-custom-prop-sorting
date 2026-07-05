export default plugin;
/**
 * A single custom-property entry passed to the `sortOrder` comparator:
 * a tuple of the property name (e.g. `"--foo"`) and its PostCSS `Declaration`.
 */
export type PropSet = [import("postcss").Declaration["prop"], import("postcss").Declaration];
export type Options = {
    /**
     * Custom comparator applied to each pair of custom properties.
     *
     * Receives two `PropSet` tuples and returns a negative number if `a` should
     * sort before `b`, positive if `a` should sort after `b`, or zero for equal.
     *
     * Defaults to a natural (numeric-aware) alphabetical sort by property name.
     */
    sortOrder?: ((a: PropSet, b: PropSet) => number) | undefined;
};
/** @type {import('postcss').PluginCreator<Options>} */
declare const plugin: import("postcss").PluginCreator<Options>;
