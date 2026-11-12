import type { Dashboard, Panel } from '@/types/painel';

const PROJETO = {
  id: '00000000-0000-4000-8000-000000000201',
  codigo: 'P01',
  titulo: 'Oficinas de arte e cidadania',
  instrumentoId: '00000000-0000-4000-8000-000000000101',
};

export const PANEL: Panel = {
  hoje: '2026-10-28',
  resumo: {
    minhasMetas: 3,
    metasVencendo: 2,
    metasVencidas: 1,
    metasSemResponsavel: 1,
    inscricoesAbertas: 2,
    atividadesProximas: 2,
  },
  prazos: [
    {
      metaId: '00000000-0000-4000-8000-000000000301',
      ordem: 4,
      objetivo: 'Entregar o relatório parcial',
      periodoFim: '2026-10-25',
      alerta: 'VENCIDA',
      responsavel: { id: 'u1', nome: 'Clara Novaes', ativo: true },
      projeto: PROJETO,
    },
    {
      metaId: '00000000-0000-4000-8000-000000000302',
      ordem: 2,
      objetivo: 'Realizar oficinas nas regiões atendidas',
      periodoFim: '2026-10-28',
      alerta: 'VENCENDO',
      responsavel: null,
      projeto: PROJETO,
    },
    {
      metaId: '00000000-0000-4000-8000-000000000303',
      ordem: 1,
      objetivo: 'Formar jovens em linguagens artísticas',
      periodoFim: '2026-11-20',
      alerta: 'VENCENDO',
      responsavel: { id: 'u2', nome: 'Núcleo Demonstração', ativo: false },
      projeto: PROJETO,
    },
  ],
  semResponsavel: [
    {
      metaId: '00000000-0000-4000-8000-000000000302',
      ordem: 2,
      objetivo: 'Realizar oficinas nas regiões atendidas',
      periodoFim: '2026-10-28',
      alerta: 'VENCENDO',
      responsavel: null,
      projeto: PROJETO,
    },
  ],
  proximasAtividades: [
    {
      id: '00000000-0000-4000-8000-000000000401',
      titulo: 'Oficina de serigrafia',
      data: '2026-11-10',
      local: 'Setor Comercial Sul',
      projeto: PROJETO,
      inscricao: {
        aberta: true,
        vagas: 30,
        inscritos: 12,
        linkPublico: '/inscrever/AbCdEfGhIjKlMnOp',
      },
    },
    {
      id: '00000000-0000-4000-8000-000000000402',
      titulo: 'Roda de conversa com as famílias',
      data: '2026-11-18',
      local: 'Sede do Instituto',
      projeto: PROJETO,
      inscricao: null,
    },
  ],
  inscricoesAbertas: [
    {
      atividadeId: '00000000-0000-4000-8000-000000000401',
      titulo: 'Oficina de serigrafia',
      data: '2026-11-10',
      local: 'Setor Comercial Sul',
      projeto: PROJETO,
      vagas: 30,
      inscritos: 12,
      linkPublico: '/inscrever/AbCdEfGhIjKlMnOp',
    },
    {
      atividadeId: '00000000-0000-4000-8000-000000000403',
      titulo: 'Mostra de dança',
      data: '2026-12-05',
      local: 'Teatro da Praça',
      projeto: PROJETO,
      vagas: 40,
      inscritos: 0,
      linkPublico: '/inscrever/QrStUvWxYzAbCdEf',
    },
  ],
  vigencias: [
    {
      id: '00000000-0000-4000-8000-000000000101',
      numeroProcesso: 'DEMO-0001/2026',
      orgaoConcedente: 'Secretaria de Cultura',
      vigenciaInicio: '2026-03-01',
      vigenciaFim: '2027-02-28',
    },
  ],
};

export const NUCLEO: Dashboard = {
  usuario: {
    nome: 'Maria Eduarda Costa',
    perfil: 'NUCLEO_PEDAGOGICO',
    setor: { id: 's1', nome: 'Pedagógico' },
  },
  painel: PANEL,
  contas: null,
};
