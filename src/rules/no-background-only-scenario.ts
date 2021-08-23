import { Background, Feature, ResultError } from "../types";

export const name = "no-background-only-scenario";

export function run(feature: Feature): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    feature.children?.forEach(child => {
        if (child.background) {
            // @ts-ignore
            if (feature.children.length <= 2) {
                // as just one background is allowed, if there is a background in the feature,
                // there must be at least, three elements in the feature to have, more than
                // one scenario
                errors.push(createError(child.background));
            }
        }
    });
    return errors;
}

function createError(background: Background): ResultError {
    return {
        message: "Backgrounds are not allowed when there is just one scenario.",
        rule: name,
        line: background.location?.line || -1,
    };
}
