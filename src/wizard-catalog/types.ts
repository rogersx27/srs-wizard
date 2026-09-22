export type QuestionKind = "short_text" | "long_text" | "single_choice" | "requirement_list" | "multiple_choice";

export interface WritingGuide {
  title: string;
  tip: string;
  groups: { title: string; ideas: string[] }[];
  examples: { title: string; text: string }[];
}

export type Ieee830Category = "CONTEXT" | "USER" | "SYSTEM" | "FUNCTIONAL" | "NON_FUNCTIONAL";

export interface WizardQuestion {
  id: string;
  prompt: string;
  helpText?: string;
  placeholder?: string;
  kind: QuestionKind;
  options?: string[];
  writingGuide?: WritingGuide;
  suggestions?: string[];
  emptyAnswerLabel?: string;
  emptyAnswerNote?: string;
  isRequirement: boolean;
  ieee830Category: Ieee830Category;
}

export interface WizardSection {
  id: string;
  title: string;
  subtitle: string;
  ieee830Category: Ieee830Category;
  questions: WizardQuestion[];
}
