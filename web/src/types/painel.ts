import type { Perfil } from '@/auth/types';
import type { DeadlineAlert } from '@/types/metas';

export interface ProjectRef {
  id: string;
  codigo: string;
  titulo: string;
  instrumentoId: string;
}

export interface PanelGoal {
  metaId: string;
  ordem: number;
  objetivo: string;
  periodoFim: string | null;
  alerta: DeadlineAlert | null;
  responsavel: { id: string; nome: string; ativo: boolean } | null;
  projeto: ProjectRef;
}

export interface UpcomingActivity {
  id: string;
  titulo: string;
  data: string;
  local: string;
  projeto: ProjectRef;
  inscricao: { aberta: boolean; vagas: number; inscritos: number; linkPublico: string } | null;
}

export interface OpenRegistration {
  atividadeId: string;
  titulo: string;
  data: string;
  local: string;
  projeto: ProjectRef;
  vagas: number;
  inscritos: number;
  linkPublico: string;
}

export interface InstrumentTerm {
  id: string;
  numeroProcesso: string;
  orgaoConcedente: string;
  vigenciaInicio: string;
  vigenciaFim: string;
}

export interface Panel {
  hoje: string;
  resumo: {
    minhasMetas: number;
    metasVencendo: number;
    metasVencidas: number;
    metasSemResponsavel: number;
    inscricoesAbertas: number;
    atividadesProximas: number;
  };
  prazos: PanelGoal[];
  semResponsavel: PanelGoal[];
  proximasAtividades: UpcomingActivity[];
  inscricoesAbertas: OpenRegistration[];
  vigencias: InstrumentTerm[];
}

export interface Dashboard {
  usuario: { nome: string; perfil: Perfil; setor: { id: string; nome: string } | null };
  painel: Panel | null;
  contas: { ativas: number; bloqueadas: number; aguardandoPrimeiroAcesso: number } | null;
}
