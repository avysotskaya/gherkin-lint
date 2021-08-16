import { createRuleTest } from "../rule-test-base";
import * as rule from "../../../rules/keywords-in-logical-order";

const runTest = createRuleTest(rule,
    'Step "<%= keyword %> <%= text %>" should not appear after step using keyword <%= priorKeyword %>');
describe("Keywords in logical order", function () {
    it("doesn't raise errors when there are no violations", function () {
        return runTest("keywords-in-logical-order/NoViolations.feature", {}, []);
    });
    it("raises errors when there are violations", function () {
        return runTest("keywords-in-logical-order/Violations.feature", {}, [
            {
                messageElements: { keyword: "When", text: "step2", priorKeyword: "then" },
                line: 5,
            },
            {
                messageElements: { keyword: "Given", text: "step3", priorKeyword: "then" },
                line: 6,
            },
            {
                messageElements: { keyword: "Given", text: "step12", priorKeyword: "when" },
                line: 10,
            },
            {
                messageElements: { keyword: "Given", text: "step22", priorKeyword: "then" },
                line: 14,
            },
            {
                messageElements: { keyword: "When", text: "step32", priorKeyword: "then" },
                line: 18,
            },
            {
                messageElements: { keyword: "When", text: "step54", priorKeyword: "then" },
                line: 24,
            },
            {
                messageElements: { keyword: "When", text: "step42", priorKeyword: "then" },
                line: 28,
            },
            {
                messageElements: { keyword: "Given", text: "step43", priorKeyword: "then" },
                line: 29,
            },
        ]);
    });
    it("raises errors when there are violations in Rule", function () {
        return runTest("keywords-in-logical-order/ViolationsInRule.feature", {}, [
            {
                line: 7,
                messageElements: { keyword: "Given", text: "step7", priorKeyword: "when" },

            },
            {
                line: 11,
                messageElements: { keyword: "Given", text: "step11", priorKeyword: "then" },
            },
            {
                line: 15,
                messageElements: { keyword: "When", text: "step15", priorKeyword: "then" },
            },
            {
                line: 21,
                messageElements: { keyword: "When", text: "step21", priorKeyword: "then" },
            },
            {
                line: 25,
                messageElements: { keyword: "When", text: "step25", priorKeyword: "then" },
            },
            {
                line:26,
                messageElements: { keyword: "Given", text: "step26", priorKeyword: "then" },
            },
        ]);
    });
});
