import { Background, Feature, ResultError, Scenario } from "../types";

const _ = require("lodash");

export const name = "name-length";
export const availableConfigs = {
    "Feature": 70,
    "Rule": 70,
    "Step": 70,
    "Scenario": 70,
};
let errors: ResultError[] = [];

export function run(feature: Feature, unused, configuration) {
    if (!feature) {
        return [];
    }
    errors = [];
    const mergedConfiguration = _.merge(availableConfigs, configuration);
    // Check Feature name length
    test(feature.name, feature.location, mergedConfiguration, "Feature");
    feature.children?.forEach(child => {
        if (child.rule) {
            test(child.rule.name, child.rule.location, mergedConfiguration, "Rule");
        } else if (child.background) {
            testSteps(child.background, mergedConfiguration);
        } else if (child.scenario) {
            test(child.scenario.name, child.scenario.location, mergedConfiguration, "Scenario");
            testSteps(child.scenario, mergedConfiguration);
        }
    });
    return errors;
}

function test(nameString, location, configuration, type) {
    if (nameString && (nameString.length > configuration[type])) {
        errors.push({
            message: `${type} name is too long. Length of ${nameString.length} is longer than the maximum allowed: ${configuration[type]}`,
            rule: name,
            line: location.line,
        });
    }
}

function testSteps(node: Background | Scenario, mergedConfiguration: any) {
    node.steps?.forEach(step => {
        // Check Step name length
        test(step.text, step.location, mergedConfiguration, "Step");
    });
}
