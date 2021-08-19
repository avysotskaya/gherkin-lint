import { messages } from "cucumber-messages";

export type Background = messages.GherkinDocument.Feature.IBackground;
export type Examples = messages.GherkinDocument.Feature.Scenario.IExamples;
export type Feature = messages.GherkinDocument.IFeature;
export type FeatureChild = messages.GherkinDocument.Feature.IFeatureChild;
export type RuleChild = messages.GherkinDocument.Feature.FeatureChild.IRuleChild;
export type Scenario = messages.GherkinDocument.Feature.IScenario;
export type Step = messages.GherkinDocument.Feature.IStep;
export type Tag = messages.GherkinDocument.Feature.ITag;
export type TableCell = messages.GherkinDocument.Feature.TableRow.ITableCell;
export type TableRow = messages.GherkinDocument.Feature.ITableRow;
export type ScenarioOutline = Scenario;
export type Envelope = messages.IEnvelope;
export type Location = messages.ILocation;
