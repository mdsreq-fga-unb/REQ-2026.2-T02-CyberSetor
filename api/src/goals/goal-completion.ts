export const COMPLETION_FIELDS = [
  'indicador',
  'formaComprovacao',
  'periodoInicio',
  'periodoFim',
] as const;

export type CompletionField = (typeof COMPLETION_FIELDS)[number];

export function missingFields(
  goal: Record<CompletionField, string | Date | null>,
): CompletionField[] {
  return COMPLETION_FIELDS.filter((field) => goal[field] === null);
}
