import { DomainError } from "../errors/DomainError.js";

export class CPF {
  private readonly value: string;

  private constructor(cpf: string) {
    this.value = cpf;
  }

  static create(cpf: string): CPF {
    const cleaned = cpf.replace(/\D/g, "");

    if (cleaned.length !== 11) {
      throw new DomainError("CPF deve ter 11 dígitos");
    }

    if (!CPF.isValid(cleaned)) {
      throw new DomainError("CPF inválido");
    }

    return new CPF(cleaned);
  }

  private static isValid(cpf: string): boolean {
    // Verifica CPFs com todos os dígitos iguais
    if (/^(\d)\1+$/.test(cpf)) {
      return false;
    }

    // Validação do primeiro dígito
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;

    // Validação do segundo dígito
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  getValue(): string {
    return this.value;
  }

  getFormatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  equals(other: CPF): boolean {
    return this.value === other.value;
  }
}
