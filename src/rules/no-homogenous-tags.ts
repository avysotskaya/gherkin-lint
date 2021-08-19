import { Examples, Feature, ResultError, Scenario } from "../types";

const _ = require("lodash");

export const name = "no-homogenous-tags";

export function run(feature: Feature) {
    if (!feature) {
        return [];
    }
    let errors: ResultError[] = [];
    // Tags that exist in every scenario and scenario outline
    // should be applied on a feature level
    let childrenTags: string[] = [];
    feature.children?.forEach(child => {
        if (child.scenario) {
            let scenario = child.scenario;
            childrenTags.push(getTagNames(scenario));
            let exampleTags: string[] = [];
            scenario.examples?.forEach(example => {
                exampleTags.push(getTagNames(example));
            });
            const homogenousExampleTags = _.intersection(...exampleTags);
            if (homogenousExampleTags.length) {
                errors.push({
                    message: `${"All Examples of a Scenario Outline have the same tag(s), " +
                    "they should be defined on the Scenario Outline instead: "}${
                        homogenousExampleTags.join(", ")}`,
                    rule: name,
                    line: scenario.location?.line || -1,
                });
            }
        }
    });
    const homogenousTags = _.intersection(...childrenTags);
    if (homogenousTags.length) {
        errors.push({
            message: `${"All Scenarios on this Feature have the same tag(s), " +
            "they should be defined on the Feature instead: "}${
                homogenousTags.join(", ")}`,
            rule: name,
            line: feature.location?.line || -1,
        });
    }
    return errors;
}

function getTagNames(node: Scenario | Examples) {
    return _.map(node.tags, tag => tag.name);
}
