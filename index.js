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

const messages = {
    sortOrderMustBeFunction: () => 'The sort order input must be provided as a function. The custom properties will be sorted alphanumerically by default.',
};

/**
 * @type {import('postcss').PluginCreator<Options>}
 * @param {Options} options
 * @returns {import('postcss').Plugin}
 */
module.exports = ({
    /* Defaults to sorting alphabetically. */
    sortOrder,
} = {}) => {
    // Sort the custom properties alphabetically and then numerically
    const alphaNumericSort = ([a], [b]) => {
        // Sort the values in alphabetical order first and then
        // sort the numbers in numerical order assuming no leading zeros
        // Example: ["a1", "a2", "a10", "a11", "a20", "a21", "a100", "b1", "b2"]
        return a.localeCompare(b, undefined, { numeric: true });
    };

    return {
        postcssPlugin: 'postcss-custom-prop-sorting',
        /** @type {import('postcss').RuleProcessor} */
        Rule(rule, { result }) {
            /** Create a map to store the custom properties. */
            /** @type Map<import('postcss').Declaration["prop"], import('postcss').Declaration> */
            const customProps = new Map();
            /** @type Map<import('postcss').Declaration["prop"], Set<import('postcss').Declaration["prop"]>> */
            const dependencies = new Map();

            /* Sort the custom properties in the order specified without re-ordering properties that rely on others */
            rule.walkDecls(/^--/, decl => {
                const { prop } = decl;

                /* If the property is already in the map throw a warning. */
                if (customProps.has(prop)) {
                    decl.warn(rule, `Duplicate custom property found: ${prop}. Only the last declaration will be kept.`, { word: prop });

                    // Remove the property from the map so that the last declaration is kept
                    customProps.delete(prop);
                }

                /* Check if the value of the custom property contains other custom properties. */
                const customPropRegex = /var\(--[^)]+\)/g;
                const customPropsInValue = decl.value.match(customPropRegex);

                // If there are custom properties in the value, add them to the dependencies map
                if (customPropsInValue) {
                    customPropsInValue.forEach(customProp => {
                        // Remove the 'var(' and ')' from the custom property name
                        const customPropName = customProp.slice(4, -1);

                        // If the custom property is not already in the map, add it
                        if (!dependencies.has(customPropName)) {
                            dependencies.set(customPropName, new Set());
                        }

                        // Add the property to the custom property's dependencies
                        dependencies.get(customPropName).add(prop);
                    });
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
            const sortedArray = [...customProps.entries()];
            if (typeof sortOrder === 'function') sortedArray.sort(sortOrder);
            else {
                if (typeof sortOrder !== 'undefined') {
                    rule.warn(result, messages.sortOrderMustBeFunction(), { word: 'sortOrder' });
                }

                sortedArray.sort(alphaNumericSort);
            }

            // Check if there are any internal dependencies between custom properties
            // that require a specific order
            sortedArray.forEach(([prop]) => {
                if (!dependencies.has(prop)) return;

                dependencies.get(prop).forEach(dependency => {
                    // Find the index of the dependency in the propArray
                    const dependencyIndex = sortedArray.findIndex(([prop]) => prop === dependency);

                    // If the dependency is found, insert the property after it
                    if (dependencyIndex === -1) return;

                    // Remove the dependent property from the array
                    const set = sortedArray.splice(dependencyIndex, 1)?.[0];

                    // Insert the dependency at the end of the array
                    sortedArray.push(set);
                });
            });

            sortedArray.reverse().forEach(([, decl], idx) => {
                // Add a newline between the last custom property and the first non-custom property (if any)
                if (idx === 0 && rule.nodes.length > 0) {
                    decl.raws.after += '\n';
                }

                rule.prepend(decl);

                if (idx === 0 && rule.nodes.length > 0) {
                    const was = decl.next().raws.before;
                    decl.next().raws.before = `\n${was}`;
                }
            });
        },
    };
};

module.postcss = true;
