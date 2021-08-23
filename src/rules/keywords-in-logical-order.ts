import { Feature, FeatureChild, ResultError, RuleChild, Step } from "../types";
import * as gherkinUtils from "./utils/gherkin";

export const name = "keywords-in-logical-order";

const keywordList = ["given", "when", "then"];

export function run(feature: Feature): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    feature.children?.forEach((child) => {
        if (child.rule) {
            child.rule.children?.forEach(ruleChild=> checkNode(ruleChild, feature, errors));
        } else {
            checkNode(child, feature, errors);
        }
    });
    return errors;
}

function checkNode(child: FeatureChild | RuleChild, feature: Feature, errors: ResultError[]) {
    let maxKeywordPosition = 0;
    const node = child.background || child.scenario ;
    node?.steps?.forEach((step) => {
        const keyword = gherkinUtils.getLanguageInsensitiveKeyword(step, feature.language);
        let keywordPosition = keywordList.indexOf(keyword);
        if (keywordPosition === -1) {
            // not found
            return;
        }
        if (keywordPosition < maxKeywordPosition) {
            const maxKeyword = keywordList[maxKeywordPosition];
            errors.push(createError(step, maxKeyword));
        }
        maxKeywordPosition = Math.max(maxKeywordPosition, keywordPosition) || keywordPosition;
    });
}

function createError(step: Step, maxKeyword: string) {
    return {
        message: `Step "${step.keyword}${step.text}" should not appear after step using keyword ${maxKeyword}`,
        rule: name,
        line: step.location?.line || -1,
    };
}
