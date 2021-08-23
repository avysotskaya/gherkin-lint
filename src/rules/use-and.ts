import { Background, Feature, ResultError, Scenario, Step } from "../types";
import * as gherkinUtils from "./utils/gherkin";

export const name = "use-and";

export function run(feature: Feature): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    feature.children?.forEach(child => {
        if (child.rule) {
            child.rule.children?.map(it => it.background || it.scenario)
                .forEach(it => checkKeyword(it, feature, errors));
        } else {
            const node = child.background || child.scenario;
            checkKeyword(node, feature, errors);
        }
    });
    return errors;
}

function checkKeyword(node: Background | Scenario | null | undefined,
    feature: Feature,
    errors: ResultError[]) {
    let previousKeyword = undefined;
    node?.steps?.forEach(step => {
        const keyword = gherkinUtils.getLanguageInsensitiveKeyword(step, feature.language);
        if (keyword === "and") {
            return;
        }
        if (keyword === previousKeyword) {
            errors.push(createError(step));
        }
        previousKeyword = keyword;
    });
}

function createError(step: Step): ResultError {
    return {
        message: `Step "${step.keyword}${step.text}" should use And instead of ${step.keyword}`,
        rule: name,
        line: step.location?.line || -1,
    };
}
