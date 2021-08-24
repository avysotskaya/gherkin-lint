import { Examples, Feature, ResultError, Scenario } from "../types";

export const name = "no-partially-commented-tag-lines";

export function run(feature: Feature): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    checkTags(feature, errors);
    feature.children?.forEach(child => {
        if (child.scenario) {
            checkTags(child.scenario, errors);
            child.scenario.examples?.forEach(example => {
                checkTags(example, errors);
            });
        }
    });
    return errors;
}

function checkTags(node: Feature | Scenario | Examples, errors: ResultError[]) {
    node.tags?.forEach(tag => {
        if (tag.name && tag.name.indexOf("#") > 0) {
            errors.push({
                message: "Partially commented tag lines not allowed",
                rule: name,
                line: tag.location?.line || 0,
            });
        }
    });
}
