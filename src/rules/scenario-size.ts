import { Background, Feature, ResultError, Scenario } from "../types";
import * as gherkinUtils from "./utils/gherkin";
import chalk from "chalk";

const _ = require("lodash");

export const name = "scenario-size";
export const availableConfigs = {
    "steps-length": {
        "Rule": 15,
        "Background": 15,
        "Scenario": 15,
    },
};

export function run(feature: Feature, unused, configuration): ResultError[] {
    if (!feature) {
        return [];
    }
    if (_.isEmpty(configuration)) {
        configuration = availableConfigs;
    }
    const errors: ResultError[] = [];
    feature.children?.forEach((child) => {
        const node = child.rule || child.background || child.scenario;
        if (node) {
            const nodeType = gherkinUtils.getNodeType(node, feature.language);
            const configKey = child.rule ? "Rule" : child.background ? "Background" : "Scenario";
            const maxSize = configuration["steps-length"][configKey];
            if (maxSize) {
                if (child.rule) {
                    child.rule.children?.forEach(ruleChild => {
                        const ruleNode = ruleChild.background || ruleChild.scenario;
                        if (ruleNode) {
                            checkSteps(ruleNode, maxSize, errors, nodeType);
                        }
                    });
                } else {
                    checkSteps(node, maxSize, errors, nodeType);
                }
            }
        }
    });
    return errors;
}

function checkSteps(node: Background | Scenario, maxSize: number, errors: ResultError[], nodeType: string) {
    let length = node.steps?.length || -1;
    if (length > maxSize) {
        errors.push({
            message: `Element ${chalk.cyan(nodeType)} too long: actual ${length}, expected ${maxSize}`,
            rule: name,
            line: node.location?.line || 0,
        });
    }
}
