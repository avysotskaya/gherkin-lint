import { Examples, Feature, ResultError, Scenario } from "../types";
import chalk from "chalk";

const _ = require("lodash");

export const name = "no-duplicate-tags";

export function run(feature: Feature): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    verifyTags(feature, errors);
    feature.children?.forEach(child => {
        if (child.scenario) {
            verifyTags(child.scenario, errors);
            child.scenario.examples?.forEach(example => {
                verifyTags(example, errors);
            });
        }
    });
    return errors;
}

function verifyTags(node: Feature | Scenario | Examples, errors: ResultError[]) {
    const failedTagNames: string[] = [];
    const uniqueTagNames: string[] = [];
    node?.tags?.forEach(tag => {
        if (tag.name) {
            if (!_.includes(failedTagNames, tag.name)) {
                if (_.includes(uniqueTagNames, tag.name)) {
                    errors.push({
                        message: `Duplicate tags are not allowed: ${chalk.yellow(tag.name)}`,
                        rule: name,
                        line: tag.location?.line || 0,
                    });
                    failedTagNames.push(tag.name);
                } else {
                    uniqueTagNames.push(tag.name);
                }
            }
        }
    });
}
