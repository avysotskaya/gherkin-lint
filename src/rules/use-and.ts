import { Feature, ResultError, Step } from "../types";
import * as gherkinUtils from "./utils/gherkin";

export const name = "use-and";

export function run(feature: Feature) {
    if (!feature) {
        return [];
    }
    let errors: ResultError[] = [];
    feature.children?.forEach(child => {
        const node = child.rule || child.background || child.scenario;
        let previousKeyword = undefined;
        if (node && "steps" in node) {
            node.steps?.forEach(step => {
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
    });
    return errors;
}

function createError(step: Step) {
    return {
        message: `Step "${step.keyword}${step.text}" should use And instead of ${step.keyword}`,
        rule: name,
        line: step.location?.line || -1,
    };
}
