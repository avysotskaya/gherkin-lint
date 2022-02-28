import { Examples, Feature, File, ResultError, Scenario, TableRow } from "../types";
import chalk from "chalk";

export const name = "no-dupe-scenario-names";

type AvailableConfigs = { "scope": "anywhere" | "in-feature"; "checkArguments": boolean; };

export const availableConfigs: AvailableConfigs = {
    "scope": "in-feature",
    "checkArguments": false,
};

let scenarios = [];

export function run(feature: Feature, file: File, configuration: AvailableConfigs): ResultError[] {
    if (!feature) {
        return [];
    }
    const errors: ResultError[] = [];
    if (configuration.scope === "in-feature") {
        scenarios = [];
    }
    feature.children?.forEach(child => {
        if (child.rule) {
            child.rule.children?.filter(it => it.scenario)
                .forEach(ruleChild => checkScenario(ruleChild.scenario!, file, errors, configuration.checkArguments));
        }
        if (child.scenario) {
            checkScenario(child.scenario, file, errors, configuration.checkArguments);
        }
    });
    return errors;
}

function checkScenario(scenario: Scenario, file: File, errors: ResultError[], checkArguments: boolean) {
    if (checkArguments && scenario.examples?.length || 0 > 0) {
            scenario.examples!.forEach(table => {
                for (const row of table.tableBody || []) {
                    const scenarioName = parseFullName(table, row, scenario);
                    checkScenarioName(scenarioName, file, scenario, errors);
                }
            });
    } else {
        checkScenarioName(scenario.name || "unknown", file, scenario, errors);
    }
}

function checkScenarioName(
    scenarioName: string,
    file: File,
    scenario: Scenario,
    errors: ResultError[]) {
    const location = {
        file: file.relativePath,
        line: scenario.location?.line || 0,
    };
    if (scenarioName in scenarios) {
        const dupes = getFileLinePairsAsStr(scenarios[scenarioName].locations);
        const message = `Scenario name "${chalk.yellow(scenarioName)}" is already used in: ${chalk.underline(dupes)}`;

        scenarios[scenarioName].locations.push(location);
        errors.push({
            message: message,
            rule: name,
            line: location.line,
        });
    } else {
        scenarios[scenarioName] = { locations: [location] };
    }
}

interface ArgumentsMap { [key: string]: string; }

function parseFullName(table: Examples, row: TableRow, scenario: Scenario) {
    const item: ArgumentsMap = { };
    const header = table.tableHeader!.cells!;
    for (let i = 0; i < row.cells!.length; i++) {
        item[header[i].value || ""] = row.cells![i]!.value || "";
    }
    return applyArguments(scenario.name || "unknown", item);
}

function applyArguments(text: string, exampleArguments: ArgumentsMap | undefined): string {
    if (exampleArguments === undefined) {
        return text;
    }
    for (const argName in exampleArguments) {
        if (!exampleArguments[argName]) {
            continue;
        }
        text = text.replace(new RegExp(`<${argName}>`, "g"), `${exampleArguments[argName]}`);
    }
    return text;
}

function getFileLinePairsAsStr(objects): string {
    let strings: string[] = [];
    objects.forEach(object => {
        strings.push(`${object.file}:${object.line}`);
    });
    return strings.join(", ");
}
