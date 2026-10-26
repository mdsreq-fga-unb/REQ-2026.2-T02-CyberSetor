import { ModalidadeAfericao } from '../generated/prisma/enums.js';

export const COMPLETION_FIELDS = [
  'indicador',
  'parametroPlanejado',
  'formaComprovacao',
  'periodoInicio',
  'periodoFim',
] as const;

export type CompletionField = (typeof COMPLETION_FIELDS)[number];

type GoalCompletion = Record<CompletionField, string | Date | null> & {
  modalidadeAfericao: ModalidadeAfericao | null;
};

// RN-02: o parâmetro planejado só é exigido na meta quantitativa.
export function missingFields(goal: GoalCompletion): CompletionField[] {
  return COMPLETION_FIELDS.filter((field) =>
    field === 'parametroPlanejado'
      ? goal.modalidadeAfericao === ModalidadeAfericao.QUANTITATIVA && goal[field] === null
      : goal[field] === null,
  );
}
