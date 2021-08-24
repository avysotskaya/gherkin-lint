import { Background, Feature, FeatureChild, ResultError, RuleChild, Scenario } from "../types";
import chalk from "chalk";

const _ = require("lodash");

export const name = "name-length";
export const availableConfigs = {
    "Feature": 70,
    "Rule": 70,
    "Step": 70,
    "Scenario": 70,
};

export function run(feature: Feature, unused, configuration): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    const mergedConfiguration = _.merge(availableConfigs, configuration);
    // Check Feature name length
    test(feature.name, feature.location, mergedConfiguration, "Feature", errors);
    feature.children?.forEach(child => {
        if (child.rule) {
            test(child.rule.name, child.rule.location, mergedConfiguration, "Rule", errors);
            child.rule.children?.forEach(ruleChild => {
                checkNode(ruleChild, mergedConfiguration, errors);
            });
        } else {
            checkNode(child, mergedConfiguration, errors);
        }
    });
    return errors;
}

function checkNode(child: FeatureChild | RuleChild,
    mergedConfiguration,
    errors: ResultError[]) {
    if (child.background) {
        testSteps(child.background, mergedConfiguration, errors);
    } else if (child.scenario) {
        test(child.scenario.name, child.scenario.location, mergedConfiguration, "Scenario", errors);
        testSteps(child.scenario, mergedConfiguration, errors);
    }
}

function test(nameString, location, configuration, type, errors) {
    if (nameString && (nameString.length > configuration[type])) {
        errors.push({
            message: `${chalk.cyan(type)} name is too long. Length of ${nameString.length
            } is longer than the maximum allowed: ${configuration[type]}`,
            rule: name,
            line: location.line,
        });
    }
}

function testSteps(node: Background | Scenario, mergedConfiguration: any, errors: ResultError[]) {
    node.steps?.forEach(step => {
        // Check Step name length
        test(step.text, step.location, mergedConfiguration, "Step", errors);
    });
}
