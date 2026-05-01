import { BusinessRuleViolation } from '../../../config/errors.js';

export function validarCpf(cpf: string): void {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
    throw new BusinessRuleViolation('RN-001', 'CPF inválido', { cpf });
  }

  const calc = (base: string, factor: number): number => {
    let sum = 0;
    for (const ch of base) {
      sum += Number(ch) * factor--;
    }
    const rem = (sum * 10) % 11;
    return rem === 10 ? 0 : rem;
  };

  const d1 = calc(digits.slice(0, 9), 10);
  const d2 = calc(digits.slice(0, 9) + d1, 11);
  if (d1 !== Number(digits[9]) || d2 !== Number(digits[10])) {
    throw new BusinessRuleViolation('RN-001', 'CPF com dígitos verificadores inválidos', { cpf });
  }
}

export function validarEmail(email: string): void {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!ok) {
    throw new BusinessRuleViolation('RN-004', 'Email inválido', { email });
  }
}

export function validarFormacoes(formacoes: unknown[]): void {
  if (!Array.isArray(formacoes) || formacoes.length === 0) {
    throw new BusinessRuleViolation('RN-002', 'Professor deve ter ao menos uma formação');
  }
}
