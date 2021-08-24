import { Feature, ResultError } from "../types";
import chalk from "chalk";

const path = require("path");
const _ = require("lodash");

export const name = "file-name";
export const availableConfigs = {
    "style": "PascalCase",
};
const checkers = {
    "PascalCase": filename => _.startCase(filename).replace(/ /g, ""),
    "Title Case": filename => _.startCase(filename),
    "camelCase": filename => _.camelCase(filename),
    "kebab-case": filename => _.kebabCase(filename),
    "snake_case": filename => _.snakeCase(filename),
};

export function run(feature: Feature, file, configuration): ResultError[] {
    if (!file) {
        return [];
    }
    const { style } = _.merge(availableConfigs, configuration);
    const filename = path.basename(file.relativePath, ".feature");
    if (!checkers[style]) {
        throw new Error(`style "${style}" not supported for file-name rule`);
    }
    const expected = checkers[style](filename);
    if (filename === expected) {
        return [];
    }
    return [{
        message: `File names should be written in ${style} e.g. "${chalk.cyan(`${expected}.feature`)}"`,
        rule: name,
        line: 0,
    }];
}
