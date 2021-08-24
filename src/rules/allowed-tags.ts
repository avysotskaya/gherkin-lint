import { Examples, Feature, ResultError, Scenario, Tag } from "../types";
import chalk from "chalk";

const _ = require("lodash");

export const name = "allowed-tags";
export const availableConfigs = {
    "tags": [],
    "patterns": [],
};

export function run(feature: Feature, unused, configuration): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    const allowedTags = configuration.tags;
    const allowedPatterns = getAllowedPatterns(configuration);
    checkTags(feature, allowedTags, allowedPatterns, errors);
    feature.children?.forEach(child => {
        if (child.scenario) {
            checkTags(child.scenario, allowedTags, allowedPatterns, errors);
            if (child.scenario.examples) {
                child.scenario.examples.forEach(example => {
                    checkTags(example, allowedTags, allowedPatterns, errors);
                });
            }
        }
    });
    return errors;
}

function getAllowedPatterns(configuration) {
    return (configuration.patterns || []).map((pattern) => new RegExp(pattern));
}

function checkTags(node: Feature | Scenario | Examples, allowedTags, allowedPatterns, errors) {
    return (node.tags || [])
        .filter(tag => !isAllowed(tag, allowedTags, allowedPatterns))
        .forEach(tag => {
            errors.push(createError(node, tag));
        });
}

function isAllowed(tag, allowedTags, allowedPatterns) {
    return _.includes(allowedTags, tag.name)
        || allowedPatterns.some((pattern) => pattern.test(tag.name));
}

function createError(node: Feature | Scenario | Examples, tag: Tag): ResultError {
    return {
        message: `Not allowed tag ${chalk.yellow(tag.name)} on ${chalk.cyan(node.keyword)}`,
        rule: name,
        line: tag.location?.line || 0,
    };
}
