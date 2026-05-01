import { QueryTypes, type Sequelize } from 'sequelize';

export function formatNumeroContrato(ano: number, seq: number): string {
  return `CONT-${ano}-${String(seq).padStart(5, '0')}`;
}

export async function proximoNumeroContrato(
  sequelize: Sequelize,
  ano: number = new Date().getUTCFullYear(),
): Promise<string> {
  const rows = await sequelize.query<{ nextval: string }>(
    `SELECT nextval('contrato_numero_seq') AS nextval`,
    { type: QueryTypes.SELECT },
  );
  const seq = Number(rows[0]?.nextval ?? 1);
  return formatNumeroContrato(ano, seq);
}

export function calcularValorTotal(valorHora: number, cargaHoraria: number): number {
  if (valorHora < 0 || cargaHoraria < 0) {
    throw new Error('valorHora e cargaHoraria devem ser não negativos');
  }
  return Math.round(valorHora * cargaHoraria * 100) / 100;
}
