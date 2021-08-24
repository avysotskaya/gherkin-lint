import { Feature, File, ResultError } from "../types";
import chalk from "chalk";

export const name = "no-dupe-feature-names";
const features = [];

export function run(feature: Feature, file: File): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    if (feature.name) {
        if (feature.name in features) {
            const dupes = features[feature.name].files.join(", ");
            features[feature.name].files.push(file.relativePath);
            errors.push({
                message: `Feature name is already used in: ${chalk.underline(dupes)}`,
                rule: name,
                line: feature.location?.line || 0,
            });
        } else {
            features[feature.name] = { files: [file.relativePath] };
        }
    }
    return errors;
}
