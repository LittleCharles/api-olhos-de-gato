import { ReviewStatus } from "../enums/index.js";

export interface ReviewProps {
  id: string;
  productId: string;
  productName?: string | null;
  authorId: string;
  authorName?: string | null;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Review {
  private props: ReviewProps;

  constructor(props: ReviewProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string | null | undefined {
    return this.props.productName;
  }

  get authorId(): string {
    return this.props.authorId;
  }

  get authorName(): string | null | undefined {
    return this.props.authorName;
  }

  get rating(): number {
    return this.props.rating;
  }

  get comment(): string {
    return this.props.comment;
  }

  get status(): ReviewStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  approve(): void {
    this.props.status = ReviewStatus.APPROVED;
    this.props.updatedAt = new Date();
  }

  reject(): void {
    this.props.status = ReviewStatus.REJECTED;
    this.props.updatedAt = new Date();
  }
}
