import type { ProjectTimeline, TimelineGoal } from '@/types/prazos';

export const PROJECT_ID = '00000000-0000-4000-8000-000000000501';

const ANA = { id: '00000000-0000-4000-8000-000000000601', nome: 'Ana Pedagógica', ativo: true };

const SETOR = {
  id: '00000000-0000-4000-8000-000000000901',
  nome: 'Coordenação Pedagógica',
  ativo: true,
};

function goal(ordem: number, data: Partial<TimelineGoal>): TimelineGoal {
  return {
    metaId: `00000000-0000-4000-8000-00000000080${ordem}`,
    ordem,
    objetivo: 'Promover a formação artística de jovens do Setor Comercial Sul',
    periodoFim: '2026-09-30',
    situacao: 'EM_ANDAMENTO',
    alerta: null,
    responsavel: ANA,
    setor: SETOR,
    rascunho: false,
    foraDaVigencia: false,
    ...data,
  };
}

export const TIMELINE: ProjectTimeline = {
  hoje: '2026-06-20',
  instrumento: {
    id: '00000000-0000-4000-8000-000000000401',
    numeroProcesso: '71000.057425/2025-03',
    orgaoConcedente: 'Ministério do Desenvolvimento e Assistência Social',
    vigenciaInicio: '2025-12-31',
    vigenciaFim: '2026-12-26',
    ativo: true,
  },
  projeto: {
    id: PROJECT_ID,
    codigo: 'P01',
    titulo: 'Oficinas de dança no Setor Comercial Sul',
    inicio: '2026-01-05',
    fim: '2026-11-20',
  },
  pendencias: { metas: 5, vencendo: 1, vencidas: 1, semResponsavel: 1 },
  metas: [
    goal(4, {
      objetivo: 'Mapear as famílias do território',
      periodoFim: '2026-03-31',
      situacao: 'CONCLUIDA',
    }),
    goal(1, {
      objetivo: 'Publicar o calendário das oficinas',
      periodoFim: '2026-06-10',
      alerta: 'VENCIDA',
    }),
    goal(2, {
      objetivo: 'Certificar os participantes',
      periodoFim: '2026-07-05',
      alerta: 'VENCENDO',
      situacao: 'PENDENTE',
      responsavel: null,
    }),
    goal(3, {
      objetivo: 'Realizar a mostra final das oficinas',
      periodoFim: '2026-12-10',
      foraDaVigencia: true,
    }),
    goal(5, {
      objetivo: 'Apresentação pública ao fim das oficinas',
      periodoFim: null,
      situacao: 'PENDENTE',
      rascunho: true,
    }),
  ],
  requisitos: [
    {
      id: '00000000-0000-4000-8000-000000000701',
      descricao: 'Diagnóstico das famílias atendidas',
      referencia: 'TR, item 12.3',
      situacao: 'ATENDIDO',
      metas: [
        {
          metaId: '00000000-0000-4000-8000-000000000804',
          ordem: 4,
          objetivo: 'Mapear as famílias do território',
          situacao: 'CONCLUIDA',
          rascunho: false,
          alcance: 'CUMPRIDA',
          projetoId: PROJECT_ID,
          projetoCodigo: 'P01',
        },
        {
          metaId: '00000000-0000-4000-8000-000000000899',
          ordem: 1,
          objetivo: 'Mapear as escolas',
          situacao: 'CONCLUIDA',
          rascunho: false,
          alcance: 'CUMPRIDA',
          projetoId: '00000000-0000-4000-8000-000000000502',
          projetoCodigo: 'P02',
        },
      ],
    },
    {
      id: '00000000-0000-4000-8000-000000000702',
      descricao: 'Frequência mínima de 70% dos participantes nas oficinas',
      referencia: 'TR, item 24.1',
      situacao: 'PENDENTE',
      metas: [
        {
          metaId: '00000000-0000-4000-8000-000000000803',
          ordem: 3,
          objetivo: 'Promover a formação artística',
          situacao: 'EM_ANDAMENTO',
          rascunho: false,
          alcance: 'PARCIALMENTE_CUMPRIDA',
          projetoId: PROJECT_ID,
          projetoCodigo: 'P01',
        },
      ],
    },
    {
      id: '00000000-0000-4000-8000-000000000703',
      descricao: 'Certificado para quem concluir a formação',
      referencia: null,
      situacao: 'SEM_META',
      metas: [],
    },
  ],
};

export const NO_GOALS: ProjectTimeline = {
  ...TIMELINE,
  pendencias: { metas: 0, vencendo: 0, vencidas: 0, semResponsavel: 0 },
  metas: [],
};
