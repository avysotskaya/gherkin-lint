// Operations on rules
import { Feature, File, ErrorLevel, ResultError, Rules } from "../types";

const glob = require("glob");
const path = require("path");
// Needed to transpile TS files if in JS
// eslint-disable-next-line import/no-unassigned-import
require("ts-node/register/transpile-only");

export function getAllRules(additionalRulesDirs?: string[]): Rules {
    let rules = {};
    const rulesDirs = [
        path.join(__dirname, "..", "rules"),
    ].concat(additionalRulesDirs || []);
    rulesDirs.forEach(rulesDir => {
        rulesDir = path.resolve(rulesDir);
        glob.sync(`${rulesDir}/*.{js,ts}`).forEach(file => {
            if (!file.includes(".d.ts")) {
                const rule = require(file);
                rules[rule.name] = rule;
            }
        });
    });
    return rules;
}

export function getRule(rule: string, additionalRulesDirs?: string[]) {
    return getAllRules(additionalRulesDirs)[rule];
}

export function doesRuleExist(rule: string, additionalRulesDirs?: string[]): boolean {
    return getRule(rule, additionalRulesDirs) !== undefined;
}

export function isRuleEnabled(ruleConfig): boolean {
    if (Array.isArray(ruleConfig)) {
        return ["error", "warn"].includes(ruleConfig[0]);
    }
    return ["error", "warn"].includes(ruleConfig);
}

export function isWarn(ruleConfig): boolean {
    if (Array.isArray(ruleConfig)) {
        return ruleConfig[0] === "warn";
    }
    return ruleConfig === "warn";
}

export function runAllEnabledRules(feature: Feature,
    file: File,
    configuration: any,
    additionalRulesDirs?: string[]): ResultError[] {
    let errors: ResultError[] = [];
    const rules = getAllRules(additionalRulesDirs);
    Object.keys(rules).forEach(ruleName => {
        let rule = rules[ruleName];
        if (isRuleEnabled(configuration[rule.name])) {
            const ruleConfig = Array.isArray(configuration[rule.name]) ? configuration[rule.name][1] : {};
            const ruleErrors: ResultError[] = rule.run(feature, file, ruleConfig);
            if (ruleErrors) {
                ruleErrors.forEach(it => it.errorLevel = isWarn(configuration[rule.name]) ? ErrorLevel.Warn : ErrorLevel.Error);
                errors = errors.concat(ruleErrors);
            }
        }
    });
    return errors;
}
