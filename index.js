/*!
 * Copyright 2023. All rights reserved.
 *
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
*/

/**
 * @typedef {[import('postcss').Declaration["prop"], import('postcss').Declaration]} PropSet
 */

/**
 * @typedef {object} Options
 * @property {(a: PropSet, b: PropSet) => PropSet[]} [sortOrder]
 **/

/**
 * @type {import('postcss').PluginCreator<Options>}
 * @param {Options} options
 * @returns {import('postcss').Plugin}
 */
module.exports = (options) => {
    /* Defaults to sorting alphabetically. */
    const {
        sortOrder = ([a,], [b,]) => (a > b ? 1 : -1),
    } = options;
    return {
        postcssPlugin: 'postcss-custom-prop-sorting',
        prepare() {
            // const validatedOptions = validateOptions(opts);
            return {
                /** @type {import('postcss').RuleProcessor} */
                Rule(rule) {
                    /* If the rule is not a root rule then return without processing. */
                    if (!rule.parent || rule.parent.type !== 'root') return;

                    /* Create a map to store the custom properties. */
                    /** @type Map<import('postcss').Declaration["prop"], import('postcss').Declaration> */
                    const customProps = new Map();

                    /* Iterate over the declarations in the rule to find the custom properties. */
                    rule.walkDecls(decl => {
                        const { prop } = decl;

                        /* If the property is not a custom property then return without processing. */
                        if (!prop.startsWith('--')) return;

                        if (customProps.has(prop)) {
                            /* If the property is already in the map throw a warning. */
                            decl.warn(rule, `Duplicate custom property found: ${prop}.`);
                        }

                        /*
                         * Add the property to the map; note that duplicates replace the existing
                         *  item b/c we want to retain the last declaration of the property.
                         **/
                        customProps.set(prop, decl);
                        /* Remove properties so that we can append them in the correct order. */
                        decl.remove();
                    });

                    /* Iterate over the custom properties in the map and append them to the rule. */
                    let propArray = Array.from(customProps);
                    if (typeof sortOrder === 'function') propArray.sort(sortOrder);

                    propArray.reverse().forEach(([, decl]) => rule.prepend(decl));
                },
            };
        },
    };
};

module.postcss = true;
