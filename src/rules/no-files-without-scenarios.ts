import { Feature, ResultError } from "../types";

export const name = "no-files-without-scenarios";

export function run(feature: Feature) {
    if (!feature) {
        return [];
    }
    let errors: ResultError[] = [];
    if (!feature.children?.some(children => children.scenario)) {
        errors.push({
            message: "Feature file does not have any Scenarios",
            rule: name,
            line: 1,
        });
    }
    return errors;
}
