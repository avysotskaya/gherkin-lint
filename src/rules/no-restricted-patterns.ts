import { Feature, FeatureChild, ResultError, RuleChild } from "../types";
import * as gherkinUtils from "./utils/gherkin";
import chalk from "chalk";

export const name = "no-restricted-patterns";
export const availableConfigs = {
    "Global": [],
    "Scenario": [],
    "ScenarioOutline": [],
    "Background": [],
    "Feature": [],
};

export function run(feature: Feature, unused, configuration): ResultError[] {
    if (!feature) {
        return [];
    }
    let errors: ResultError[] = [];
    const restrictedPatterns = getRestrictedPatterns(configuration);
    const language = feature.language || "en";
    // Check the feature itself
    checkNameAndDescription(feature, restrictedPatterns, language, errors);
    // Check the feature children
    feature.children?.forEach(child => {
        if (child.rule) {
            child.rule.children?.forEach(childRule => {
                checkNode(childRule, restrictedPatterns, language, errors);
            });
        } else {
            checkNode(child, restrictedPatterns, language, errors);
        }
    });
    return errors;
}

function checkNode(child: FeatureChild | RuleChild,
    restrictedPatterns: {},
    language: string,
    errors: ResultError[]) {
    const node = child.background || child.scenario;
    if (node) {
        checkNameAndDescription(node, restrictedPatterns, language, errors);
        // And all the steps of each child
        node.steps?.forEach(step => {
            checkStepNode(step, node, restrictedPatterns, language, errors);
        });
    }
}

function getRestrictedPatterns(configuration) {
    // Patterns applied to everything; feature, scenarios, etc.
    let globalPatterns = (configuration.Global || []).map(pattern => new RegExp(pattern, "i"));
    let restrictedPatterns = {};
    Object.keys(availableConfigs).forEach(key => {
        const resolvedKey = key.toLowerCase().replace(/ /g, "");
        const resolvedConfig = (configuration[key] || []);
        restrictedPatterns[resolvedKey] = resolvedConfig.map(pattern => new RegExp(pattern, "i"));
        restrictedPatterns[resolvedKey] = restrictedPatterns[resolvedKey].concat(globalPatterns);
    });
    return restrictedPatterns;
}

function getRestrictedPatternsForNode(node, restrictedPatterns, language) {
    let key = gherkinUtils.getLanguageInsensitiveKeyword(node, language).toLowerCase();
    return restrictedPatterns[key];
}

function checkNameAndDescription(node, restrictedPatterns, language, errors) {
    getRestrictedPatternsForNode(node, restrictedPatterns, language)
        .forEach(pattern => {
            check(node, "name", pattern, language, errors);
            check(node, "description", pattern, language, errors);
        });
}

function checkStepNode(node, parentNode, restrictedPatterns, language, errors) {
    // Use the node keyword of the parent to determine which rule configuration to use
    getRestrictedPatternsForNode(parentNode, restrictedPatterns, language)
        .forEach(pattern => {
            check(node, "text", pattern, language, errors);
        });
}

function check(node, property, pattern, language, errors) {
    if (!node[property]) {
        return;
    }
    let strings = [node[property]];
    const type = gherkinUtils.getNodeType(node, language);
    if (property === "description") {
        // Descriptions can be multiline, in which case the description will contain escaped
        // newline characters "\n". If a multiline description matches one of the restricted patterns
        // when the error message gets printed in the console, it will break the message into multiple lines.
        // So let's split the description on newline chars and test each line separately.
        // To make sure we don't accidentally pick up a doubly escaped new line "\\n" which would appear
        // if a user wrote the string "\n" in a description, let's replace all escaped new lines
        // with a sentinel, split lines and then restore the doubly escaped new line
        const escapedNewLineSentinel = "<!gherkin-lint new line sentinel!>";
        const escapedNewLine = "\\n";
        strings = node[property]
            .replace(escapedNewLine, escapedNewLineSentinel)
            .split("\n")
            .map(string => string.replace(escapedNewLineSentinel, escapedNewLine));
    }
    strings.forEach(item => {
        // We use trim() on the examined string because names and descriptions can contain
        // white space before and after, unlike steps
        if (item.trim().match(pattern)) {
            errors.push({
                message: `${type} ${property}: "${chalk.cyan(item.trim())}" matches restricted pattern "${chalk.yellow(pattern)}"`,
                rule: name,
                line: node.location.line,
            });
        }
    });
}
