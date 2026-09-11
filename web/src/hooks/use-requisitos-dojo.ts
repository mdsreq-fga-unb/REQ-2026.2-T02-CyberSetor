'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface RequisitoDojo {
  id: string;
  origem: string;
  indicador: string;
  parametroAfericao: string;
  formaVerificacao: string;
  frequenciaApuracao: string;
}

export type CreateRequisitoDojoDto = Omit<RequisitoDojo, 'id'>;

export function useRequisitosDojo() {
  return useQuery({
    queryKey: ['requisitos-dojo'],
    queryFn: () => api<RequisitoDojo[]>('/requisitos-dojo'),
  });
}

export function useCriarRequisitoDojo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateRequisitoDojoDto) =>
      api<RequisitoDojo>('/requisitos-dojo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['requisitos-dojo'] }),
  });
}
