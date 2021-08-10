import { Feature, ResultError, Step } from "../types";
import * as gherkinUtils from "./utils/gherkin";

export const name = "keywords-in-logical-order";

export function run(feature: Feature) {
    if (!feature) {
        return [];
    }
    let errors: ResultError[] = [];
    feature.children?.forEach((child) => {
        const node = child.background || child.scenario;
        const keywordList = ["given", "when", "then"];
        let maxKeywordPosition = 0;
        node?.steps?.forEach((step) => {
            const keyword = gherkinUtils.getLanguageInsensitiveKeyword(
                step,
                feature.language
            );
            let keywordPosition = keywordList.indexOf(keyword);
            if (keywordPosition === -1) {
                //   not found
                return;
            }
            if (keywordPosition < maxKeywordPosition) {
                const maxKeyword = keywordList[maxKeywordPosition];
                errors.push(createError(step, maxKeyword));
            }
            maxKeywordPosition =
                Math.max(maxKeywordPosition, keywordPosition) || keywordPosition;
        });
    });
    return errors;
}

function createError(step: Step, maxKeyword: string) {
    return {
        message: `Step "${step.keyword}${step.text}" should not appear after step using keyword ${maxKeyword}`,
        rule: name,
        line: step.location?.line || -1,
    };
}
