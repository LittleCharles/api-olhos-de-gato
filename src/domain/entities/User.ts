import { UserRole } from "../enums/index.js";
import { Email } from "../value-objects/Email.js";

export interface UserProps {
  id: string;
  email: Email;
  passwordHash: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  isActive: boolean;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get phone(): string | null | undefined {
    return this.props.phone;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get resetToken(): string | null | undefined {
    return this.props.resetToken;
  }

  get resetTokenExpiry(): Date | null | undefined {
    return this.props.resetTokenExpiry;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  isCustomer(): boolean {
    return this.props.role === UserRole.CUSTOMER;
  }

  updateName(name: string): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
  }

  updatePhone(phone: string): void {
    this.props.phone = phone;
    this.props.updatedAt = new Date();
  }

  setResetToken(token: string, expiry: Date): void {
    this.props.resetToken = token;
    this.props.resetTokenExpiry = expiry;
    this.props.updatedAt = new Date();
  }

  clearResetToken(): void {
    this.props.resetToken = null;
    this.props.resetTokenExpiry = null;
    this.props.updatedAt = new Date();
  }

  updatePasswordHash(hash: string): void {
    this.props.passwordHash = hash;
    this.clearResetToken();
  }
}
