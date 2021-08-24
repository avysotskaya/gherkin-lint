import * as path from "path";
import { expect } from "chai";
import * as linter from "../../linter";
import * as configParser from "../../config/config-parser";
import stripAnsi from "strip-ansi";

describe("rulesdir CLI option", function () {
    it("loads additional rules from specified directories", function () {
        const additionalRulesDirs = [
            path.join(__dirname, "rules"), // absolute path
            path.join("src/__tests__", "rulesdir", "other_rules"), // relative path from root
        ];
        const config = configParser.getConfiguration(path.join(__dirname, ".gherkin-lintrc"), additionalRulesDirs);
        const featureFile = path.join(__dirname, "simple.features");
        return linter.lint([featureFile], config, additionalRulesDirs)
            .then((results) => {
                results?.forEach(result=> result.errors?.forEach(error => error.message = stripAnsi(error.message)));
                expect(results).to.deep.equal([
                    {
                        errors: [
                            { // This one is to make sure we don't accidentally regress and always load the default rules
                                line: 1,
                                errorLevel: 1,
                                message: 'Wrong indentation for "Feature", expected indentation level of 0, but got 4',
                                rule: "indentation",
                            },
                            {
                                line: 109,
                                errorLevel: 0,
                                message: "Another custom-list error",
                                rule: "another-custom-list",
                            },
                            {
                                line: 123,
                                errorLevel: 0,
                                message: "Custom error",
                                rule: "custom",
                            },
                            {
                                line: 456,
                                errorLevel: 1,
                                message: "Another custom error",
                                rule: "another-custom",
                            },
                        ],
                        filePath: featureFile,
                    },
                ]);
            });
    });
});
