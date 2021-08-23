import { assert } from "chai";
import { verifyConfigurationFile } from "../config/config-verifier";

describe("Config Verifier", function () {
    describe("Verification is successful when", function () {
        it('rules are set to "error", "warn" or "off"', function () {
            assert.deepEqual(verifyConfigurationFile({
                "no-files-without-scenarios": "error",
                "no-unnamed-features": "error",
                "no-unnamed-scenarios": "error",
                "no-dupe-scenario-names": "error",
                "no-dupe-feature-names": "warn",
                "no-partially-commented-tag-lines": "warn",
                "indentation": "warn",
                "no-trailing-spaces": "error",
                "no-multiple-empty-lines": "off",
            }), []);
        });
        it('a rule config is an array of size 2, with an "error/warn/off" state and another config value', function () {
            assert.deepEqual(verifyConfigurationFile({ "new-line-at-eof": ["error", "yes"] }), []);
        });
        it('a rule config is an array of size 2, with an "error/warn/off" state and a keyworded array', function () {
            assert.deepEqual(verifyConfigurationFile({
                // @ts-ignore
                "indentation": ["error", { "Feature": 1, "Background": 1, "Scenario": 1, "Step": 1, "given": 1, "and": 1 }],
            }), []);
        });
    });
    describe("Verification fails when", function () {
        it("a non existing rule", function () {
            // @ts-ignore
            assert.deepEqual(verifyConfigurationFile({ "fake-rule": "error" }), ['Rule "fake-rule" does not exist']);
        });
        it("a non existing rule sub-config", function () {
            assert.deepEqual(verifyConfigurationFile({
                // @ts-ignore
                "indentation": ["error", { "featur": 0 }],
                "new-line-at-eof": ["error", "y"],
            }), [
                'Invalid rule configuration for "indentation" - The rule does not have the specified configuration option "featur"',
                'Invalid rule configuration for "new-line-at-eof" - The rule does not have the specified configuration option "y"',
            ]);
        });
        it('rule config that\'s not properly configured to "error/warn/off"', function () {
            assert.deepEqual(verifyConfigurationFile({
                "no-files-without-scenarios": "o",
                "new-line-at-eof": ["o", "yes"],
                // @ts-ignore
                "indentation": ["o", { "Feature": 1, "Background": 1, "Scenario": 1, "Step": 1, "given": 1, "and": 1 }],
            }), [
                'Invalid rule configuration for "no-files-without-scenarios" - The the config should be "error", "warn" or "off"',
                'Invalid rule configuration for "new-line-at-eof" - The first part of the config should be "error", "warn" or "off"',
                'Invalid rule configuration for "indentation" - The first part of the config should be "error", "warn" or "off"']);
        });
        it("an array configuration doesn't have exactly 2 parts", function () {
            assert.deepEqual(verifyConfigurationFile({ "new-line-at-eof": ["error"] }), [
                'Invalid rule configuration for "new-line-at-eof" - The config should only have 2 parts.',
            ]);
            assert.deepEqual(verifyConfigurationFile({ "new-line-at-eof": ["error", "yes", "p3"] }), [
                'Invalid rule configuration for "new-line-at-eof" - The config should only have 2 parts.',
            ]);
            assert.deepEqual(verifyConfigurationFile({ "new-line-at-eof": ["warn", "yes", "p3"] }), [
                'Invalid rule configuration for "new-line-at-eof" - The config should only have 2 parts.',
            ]);
        });
    });
});

