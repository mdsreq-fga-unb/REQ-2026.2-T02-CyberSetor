import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type {
  PublicForm,
  PublicSubmission,
  SubmittedRegistration,
} from '@/types/inscricao-publica';

/** Formulário público: sem conta nem sessão (RF11), pelo código do link da inscrição. */
export function publicFormKey(codigo: string) {
  return ['inscricao-publica', codigo] as const;
}

export function usePublicForm(codigo: string) {
  return useQuery({
    queryKey: publicFormKey(codigo),
    queryFn: () => apiRequest<PublicForm>(`/public/registrations/${encodeURIComponent(codigo)}`),
    retry: false,
  });
}

export function useSubmitRegistration(codigo: string) {
  return useMutation({
    mutationFn: (data: PublicSubmission) =>
      apiRequest<SubmittedRegistration>(`/public/registrations/${encodeURIComponent(codigo)}`, {
        method: 'POST',
        body: data,
      }),
  });
}
