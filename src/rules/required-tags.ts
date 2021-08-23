import { Feature, ResultError, Tag } from "../types";
import * as gherkinUtils from "./utils/gherkin";

const _ = require("lodash");

export const name = "required-tags";
export const availableConfigs = {
    tags: [],
    ignoreUntagged: true,
};

export function run(feature: Feature, unused, config): ResultError[] {
    if (!feature) {
        return [];
    }
    const mergedConfig = _.merge({}, availableConfigs, config);
    const errors: ResultError[] = [];
    feature.children?.forEach((child) => {
        if (child.scenario) {
            const type = gherkinUtils.getNodeType(child.scenario, feature.language);
            const line = child.scenario.location?.line || -1;
            const scenarioTags = child.scenario?.tags || [];
            // Check each Scenario for the required tags
            mergedConfig.tags.forEach(tag => {
                if (!checkTagExists(tag, mergedConfig.ignoreUntagged, scenarioTags)) {
                    errors.push(createError(tag, type, line));
                }
            });
        }
    });
    return errors;
}

function checkTagExists(requiredTag: string, ignoreUntagged: boolean, scenarioTags: Tag[]): boolean {
    return (ignoreUntagged && scenarioTags.length === 0)
        || scenarioTags.some((tagObj) => RegExp(requiredTag).test(tagObj.name || ""));
}

function createError(requiredTag: string, scenarioType: string, scenarioLine: number) {
    return {
        message: `No tag found matching ${requiredTag} for ${scenarioType}`,
        rule: name,
        line: scenarioLine,
    };
}
