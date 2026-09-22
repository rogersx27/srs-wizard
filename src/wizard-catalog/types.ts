export type QuestionKind = "short_text" | "long_text" | "single_choice" | "requirement_list";

export type Ieee830Category = "CONTEXT" | "USER" | "SYSTEM" | "FUNCTIONAL" | "NON_FUNCTIONAL";

export interface WizardQuestion {
  id: string;
  prompt: string;
  helpText?: string;
  placeholder?: string;
  kind: QuestionKind;
  options?: string[];
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
