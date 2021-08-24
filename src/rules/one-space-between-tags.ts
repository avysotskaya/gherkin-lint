import { Examples, Feature, ResultError, Scenario } from "../types";
import chalk from "chalk";

const _ = require("lodash");

export const name = "one-space-between-tags";

export function run(feature: Feature): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    testTags(feature, errors);
    feature.children?.forEach(child => {
        if (child.scenario) {
            testTags(child.scenario, errors);
            child.scenario.examples?.forEach(example => {
                testTags(example, errors);
            });
        }
    });
    return errors;
}

function testTags(node: Feature | Scenario | Examples, errors: ResultError[]) {
    _(node.tags)
        .groupBy("location.line")
        .sortBy("location.column")
        .forEach(tags => {
            _.range(tags.length - 1)
                .map(i => {
                    if (tags[i].location.column + tags[i].name.length < tags[i + 1].location.column - 1) {
                        errors.push({
                            line: tags[i].location.line,
                            rule: name,
                            message: `There is more than one space between the tags ${chalk.yellow(tags[i].name)
                            } and ${chalk.yellow(tags[i + 1].name)}`,
                        });
                    }
                });
        });
}
