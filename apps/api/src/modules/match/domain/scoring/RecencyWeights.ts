import { RECENCY_WEIGHTS } from '@cebees/shared-types';

export function monthsBetween(from: Date, to: Date): number {
  const years = to.getUTCFullYear() - from.getUTCFullYear();
  const months = to.getUTCMonth() - from.getUTCMonth();
  const days = to.getUTCDate() - from.getUTCDate();
  return years * 12 + months + (days < 0 ? -1 : 0);
}

export function recencyWeight(dataFim: Date, reference: Date = new Date()): number {
  const months = Math.max(0, monthsBetween(dataFim, reference));
  for (const entry of RECENCY_WEIGHTS) {
    if (months <= entry.maxMonths) return entry.weight;
  }
  return RECENCY_WEIGHTS[RECENCY_WEIGHTS.length - 1]!.weight;
}
