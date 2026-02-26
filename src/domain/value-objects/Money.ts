import { DomainError } from "../errors/DomainError.js";

export class Money {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): Money {
    if (value < 0) {
      throw new DomainError("Valor monetário não pode ser negativo");
    }
    return new Money(Math.round(value * 100) / 100);
  }

  static zero(): Money {
    return new Money(0);
  }

  getValue(): number {
    return this.value;
  }

  add(other: Money): Money {
    return Money.create(this.value + other.getValue());
  }

  subtract(other: Money): Money {
    return Money.create(this.value - other.getValue());
  }

  multiply(quantity: number): Money {
    return Money.create(this.value * quantity);
  }

  format(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(this.value);
  }

  equals(other: Money): boolean {
    return this.value === other.value;
  }

  isGreaterThan(other: Money): boolean {
    return this.value > other.getValue();
  }
}
