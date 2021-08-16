Feature: Feature with keywords-in-logical-order violations

Rule: Violations in Rule

Example: Given after When
  When step6
  Given step7

Example: Given after Then
  Then step10
  Given step11

Example: When after Then
  Then step14
  When step15

Example: When after Then with Ands
  Then step18
  And step19
  And step20
  When step21

Example: All violations
  Then step24
  When step25
  Given step26
