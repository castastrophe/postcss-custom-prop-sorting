/*!
 * Copyright 2025. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
export type PropSet = [import('postcss').Declaration["prop"], import('postcss').Declaration];
export type Options = {
    /**
     * Custom comparator applied to each pair of custom properties.
     *
     * Receives two `PropSet` tuples and returns a negative number if `a` should
     * sort before `b`, positive if `a` should sort after `b`, or zero for equal.
     *
     * Defaults to a natural (numeric-aware) alphabetical sort by property name.
     */
    sortOrder?: (a: PropSet, b: PropSet) => number;
};
/** @type {import('postcss').PluginCreator<Options>} */
declare const plugin: import('postcss').PluginCreator<Options>;
export default plugin;
