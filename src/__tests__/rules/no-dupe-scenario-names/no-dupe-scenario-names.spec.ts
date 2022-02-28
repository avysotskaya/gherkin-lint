import { createRuleTest } from "../rule-test-base";
import * as rule from "../../../rules/no-dupe-scenario-names";

const runTest = createRuleTest(rule, "Scenario name \"<%= name %>\" is already used in: <%= location %>");

describe("No Duplicate Scenario Names Rule", function () {
    it("doesn't raise errors when there are no duplicate scenario names in a single file", function () {
        return runTest("no-dupe-scenario-names/UniqueScenarioNames.feature", {}, []);
    });
    it("doesn't raise errors when there are no duplicate scenario names multiple files", function () {
        return runTest("no-dupe-scenario-names/UniqueScenarioNamesAcrossFiles1.feature", {}, [])
            .then(() => {
                return runTest("no-dupe-scenario-names/UniqueScenarioNamesAcrossFiles2.feature", {}, []);
            });
    });
    it("raises errors when there duplicate Scenario and Scenario Outline names in a single file", function () {
        return runTest("no-dupe-scenario-names/DuplicateScenarioNames.feature", {}, [
            {
                line: 9,
                messageElements: {
                    name: "This is a non unique name",
                    location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNames.feature:6",
                },
            },
            {
                line: 17,
                messageElements: {
                    name: "This is a non unique name",
                    location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNames.feature:6, " +
                        "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNames.feature:9" },
            },
        ]);
    });
    it("raises errors when there duplicate Scenario and Scenario Outline names in multiple files", function () {
        return runTest("no-dupe-scenario-names/DuplicateScenarioNamesAcrossFiles1.feature", {}, [])
            .then(() => {
                return runTest("no-dupe-scenario-names/DuplicateScenarioNamesAcrossFiles2.feature", {}, [
                    {
                        line: 6,
                        messageElements: {
                            name: "This is a Scenario",
                            location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNamesAcrossFiles1.feature:6",
                        },
                    },
                    {
                        line: 9,
                        messageElements: {
                            name: "This is a Scenario Outline",
                            location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNamesAcrossFiles1.feature:9",
                        },
                    },
                    {
                        line: 17,
                        messageElements: {
                            name: "This is an Example",
                            location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNamesAcrossFiles1.feature:17",
                        },
                    },
                ]);
            });
    });
    it("doesn't raise errors when there are duplicate scenario names in different files", function () {
        return runTest("no-dupe-scenario-names/DuplicateScenarioNamesAcrossFiles1.feature", { scope: "in-feature" }, [])
            .then(() => {
                return runTest("no-dupe-scenario-names/DuplicateScenarioNamesAcrossFiles2.feature",
                    { scope: "in-feature" },
                    []);
            });
    });
    it("doesn't raise errors when duplicate arguments applied but checkArguments:false", function () {
        return runTest("no-dupe-scenario-names/DuplicateScenarioNamesInExamples.feature",
            { checkArguments: false, scope: "in-feature" },
            []);
    });
    it("raises errors when there are duplicate Scenario names with arguments applied", function () {
        return runTest("no-dupe-scenario-names/DuplicateScenarioNamesInExamples.feature",
            { checkArguments: true, scope: "in-feature" },
            [
                {
                    line: 9,
                    messageElements: {
                        name: "This is a non unique field",
                        location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNamesInExamples.feature:6",
                    },
                },
                {
                    line: 18,
                    messageElements: {
                        name: "This is a non unique name",
                        location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNamesInExamples.feature:9",
                    },
                },
                {
                    line: 21,
                    messageElements: {
                        name: "This is a non unique argument",
                        location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNamesInExamples.feature:21",
                    },
                },
                {
                    line: 28,
                    messageElements: {
                        name: "This is a non unique argument",
                        location: "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNamesInExamples.feature:21, " +
                            "src/__tests__/rules/no-dupe-scenario-names/DuplicateScenarioNamesInExamples.feature:21",
                    },
                },
            ]);
    });
});
