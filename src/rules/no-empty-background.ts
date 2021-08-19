import { Background, Feature, ResultError } from "../types";

export const name = "no-empty-background";

export function run(feature: Feature) {
    if (!feature) {
        return [];
    }
    let errors: ResultError[] = [];
    feature.children?.forEach(child => {
        if (child.background) {
            if (child.background?.steps?.length === 0) {
                errors.push(createError(child.background));
            }
        }
    });
    return errors;
}

function createError(background: Background) {
    return {
        message: "Empty backgrounds are not allowed.",
        rule: name,
        line: background.location?.line || -1,
    };
}
