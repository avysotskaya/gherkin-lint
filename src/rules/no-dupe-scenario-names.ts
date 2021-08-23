import { Feature, File, ResultError, Scenario } from "../types";

export const name = "no-dupe-scenario-names";
export const availableConfigs = [
    "anywhere",
    "in-feature",
];
let scenarios = [];

export function run(feature: Feature, file: File, configuration): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    if (configuration === "in-feature") {
        scenarios = [];
    }
    feature.children?.forEach(child => {
        if (child.rule) {
            child.rule.children?.filter(it => it.scenario)
                .forEach(ruleChild => checkScenario(ruleChild.scenario!, file, errors));
        }
        if (child.scenario) {
            checkScenario(child.scenario, file, errors);
        }
    });
    return errors;
}

function checkScenario(scenario: Scenario, file: File, errors: ResultError[]) {
    if (scenario.name) {
        if (scenario.name in scenarios) {
            const dupes = getFileLinePairsAsStr(scenarios[scenario.name].locations);
            scenarios[scenario.name].locations.push({
                file: file.relativePath,
                line: scenario.location?.line,
            });
            errors.push({
                message: `Scenario name is already used in: ${dupes}`,
                rule: name,
                line: scenario.location?.line || -1,
            });
        } else {
            scenarios[scenario.name] = {
                locations: [
                    {
                        file: file.relativePath,
                        line: scenario.location?.line,
                    },
                ],
            };
        }
    }
}

function getFileLinePairsAsStr(objects): string {
    let strings: string[] = [];
    objects.forEach(object => {
        strings.push(`${object.file}:${object.line}`);
    });
    return strings.join(", ");
}
