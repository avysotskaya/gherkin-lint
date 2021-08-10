import { Feature, ResultError } from "../types";

export const name = "no-unnamed-features";

export function run(feature: Feature) {
    let errors: ResultError[] = [];
    if (!feature || !feature.name) {
        const location = feature?.location?.line || 0;
        errors.push({
            message: "Missing Feature name",
            rule: name,
            line: location,
        });
    }
    return errors;
}
