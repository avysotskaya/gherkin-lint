import * as gherkinUtils from "./utils/gherkin";
import { Examples, Feature, ResultError, Scenario, Step, Tag } from "../types";
import chalk from "chalk";

const _ = require("lodash");

export const name = "indentation";
const defaultConfig = {
    "Feature": 0,
    "Background": 0,
    "Rule": 0,
    "Scenario": 0,
    "Example": 0,
    "Step": 2,
    "Examples": 0,
    "example": 2,
    "given": 2,
    "when": 2,
    "then": 2,
    "and": 2,
    "but": 2,
};
export const availableConfigs = _.merge({}, defaultConfig, {
    // The values here are unused by the config parsing logic.
    "feature tag": -1,
    "scenario tag": -1,
});

function mergeConfiguration(configuration) {
    let mergedConfiguration = _.merge({}, defaultConfig, configuration);
    if (!Object.prototype.hasOwnProperty.call(mergedConfiguration, "feature tag")) {
        mergedConfiguration["feature tag"] = mergedConfiguration["Feature"];
    }
    if (!Object.prototype.hasOwnProperty.call(mergedConfiguration, "scenario tag")) {
        mergedConfiguration["scenario tag"] = mergedConfiguration["Scenario"];
    }
    if (!Object.prototype.hasOwnProperty.call(mergedConfiguration, "example tag")) {
        mergedConfiguration["example tag"] = mergedConfiguration["Example"];
    }
    return mergedConfiguration;
}

export function run(feature: Feature, unused, configuration): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    const mergedConfiguration = mergeConfiguration(configuration);

    function test(parsedLocation, type) {
        // location.column is 1 index based so, when we compare with the expected
        // indentation we need to subtract 1
        if (parsedLocation.column - 1 !== mergedConfiguration[type]) {
            errors.push({
                message: `Wrong indentation for "${chalk.cyan(type)
                }", expected indentation level of ${mergedConfiguration[type]
                }, but got ${parsedLocation.column - 1}`,
                rule: name,
                line: parsedLocation.line,
            });
        }
    }

    function testStep(step: Step) {
        let stepType = gherkinUtils.getLanguageInsensitiveKeyword(step, feature.language);
        stepType = stepType in configuration ? stepType : "Step";
        test(step.location, stepType);
    }

    function testTags(tags: Tag[] | null | undefined, type: string) {
        _(tags).groupBy("location.line").forEach(tagLocationGroup => {
            const firstTag = _(tagLocationGroup).sortBy("location.column").head();
            test(firstTag.location, type);
        });
    }

    // In cucumber, Example is alias for Scenario
    function testExample(scenario: Scenario) {
        test(scenario.location, "Example");
        testTags(scenario.tags, "example tag");
        scenario.steps?.forEach(testStep);
    }

    // Applies to Scenario and Scenario Outline
    function testScenario(scenario: Scenario) {
        test(scenario.location, "Scenario");
        testTags(scenario.tags, "scenario tag");
        scenario.steps?.forEach(testStep);
        if (scenario.examples) {
            testExamples(scenario.examples);
        }
    }

    function testExamples(examples: Examples[]) {
        examples.forEach(example => {
            test(example.location, "Examples");
            if (example.tableHeader) {
                test(example.tableHeader.location, "example");
                example.tableBody?.forEach(row => {
                    test(row.location, "example");
                });
            }
        });
    }

    test(feature.location, "Feature");
    testTags(feature.tags, "feature tag");
    feature.children?.forEach(child => {
        if (child.rule) {
            test(child.rule.location, "Rule");
            if (child.rule.children) {
                child.rule.children.forEach(ruleChild => {
                    if (ruleChild.background) {
                        test(ruleChild.background.location, "Background");
                    }
                    if (ruleChild.scenario) {
                        testExample(ruleChild.scenario);
                    }
                });
            }
        } else if (child.background) {
            test(child.background.location, "Background");
            child.background.steps?.forEach(testStep);
        } else if (child.scenario) {
            testScenario(child.scenario);
        }
    });
    return errors;
}
