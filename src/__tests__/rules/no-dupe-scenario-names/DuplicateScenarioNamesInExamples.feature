Feature: This is a Feature with non unique scenario names

  Background:
    Given I have a Background

  Scenario: This is a non unique field
    Then this is a then step

  Scenario Outline: This is a non unique <name>
    Then this is a then step <foo>
    Examples:
      | foo  | name  |
      | bar  | field |
      | baz  | name|

  Rule: This is a rule

    Example: This is a non unique name


  Scenario Outline: This is a non unique <argument>
    Then this is a then step <foo>
    Examples:
      | foo  | argument |
      | bar  | argument |
      | baz  | argument  |

  Scenario: This is a non unique argument
    Then this is a then step
