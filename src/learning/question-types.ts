import type { FactKey } from './fact-key';

export type QuestionType =
  | 'equal-groups'
  | 'array'
  | 'numeric'
  | 'expression-choice'
  | 'share'
  | 'fact-family';

/** Concrete-Representational-Abstract: pictures for low boxes, symbols once the fact is known. */
export type Representation = 'concrete' | 'symbolic';

interface QuestionBase {
  factKey: FactKey;
  representation: Representation;
  answer: number;
}

interface NumberChoice {
  choices: number[];
  answerIndex: number;
}

/** VN grade-2 reading: `groupSize x groupCount` = groupSize taken groupCount times. */
export interface EqualGroupsQuestion extends QuestionBase, NumberChoice {
  type: 'equal-groups';
  groupSize: number;
  groupCount: number;
  expression: string;
}

export interface ArrayQuestion extends QuestionBase, NumberChoice {
  type: 'array';
  rows: number;
  cols: number;
}

export interface NumericQuestion extends QuestionBase, NumberChoice {
  type: 'numeric';
  expression: string;
}

/** Pick the expression that matches the picture; the swapped factor order is never a wrong option. */
export interface ExpressionChoiceQuestion extends QuestionBase {
  type: 'expression-choice';
  groupSize: number;
  groupCount: number;
  expressions: string[];
  answerIndex: number;
}

/** Share `total` equally among `groups`; answer = each share. */
export interface ShareQuestion extends QuestionBase, NumberChoice {
  type: 'share';
  total: number;
  groups: number;
}

/** A triangle of related facts with one value hidden. */
export interface FactFamilyQuestion extends QuestionBase, NumberChoice {
  type: 'fact-family';
  factors: [number, number];
  product: number;
  hidden: 'product' | 'factor';
}

export type Question =
  | EqualGroupsQuestion
  | ArrayQuestion
  | NumericQuestion
  | ExpressionChoiceQuestion
  | ShareQuestion
  | FactFamilyQuestion;
