export type Priority = "ESSENTIAL" | "CONDITIONAL" | "OPTIONAL";

export interface AnswerProps {
  id: string;
  projectId: string;
  questionId: string;
  valueText: string | null;
  valueList: string[] | null;
  priority: Priority | null;
  itemPriorities?: (Priority | null)[] | null;
  updatedAt: Date;
}

export class Answer {
  constructor(private readonly props: AnswerProps) {}

  get id(): string {
    return this.props.id;
  }

  get projectId(): string {
    return this.props.projectId;
  }

  get questionId(): string {
    return this.props.questionId;
  }

  get valueText(): string | null {
    return this.props.valueText;
  }

  get valueList(): string[] | null {
    return this.props.valueList;
  }

  get priority(): Priority | null {
    return this.props.priority;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get itemPriorities(): (Priority | null)[] | null {
    return this.props.itemPriorities ?? null;
  }

  isEmpty(): boolean {
    const noText = !this.props.valueText || this.props.valueText.trim() === "";
    const noList = !this.props.valueList || this.props.valueList.filter((v) => v.trim() !== "").length === 0;
    return noText && noList;
  }

  toJSON(): AnswerProps {
    return { ...this.props };
  }
}
