export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface ProjectProps {
  id: string;
  slug: string;
  clientName: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export class Project {
  constructor(private readonly props: ProjectProps) {}

  get id(): string {
    return this.props.id;
  }

  get slug(): string {
    return this.props.slug;
  }

  get clientName(): string {
    return this.props.clientName;
  }

  get status(): ProjectStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get completedAt(): Date | null {
    return this.props.completedAt;
  }

  isCompleted(): boolean {
    return this.props.status === "COMPLETED";
  }

  toJSON(): ProjectProps {
    return { ...this.props };
  }
}
