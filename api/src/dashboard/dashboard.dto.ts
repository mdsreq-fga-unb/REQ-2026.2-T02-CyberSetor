import { ApiProperty } from '@nestjs/swagger';
import { DEADLINE_ALERTS, type DeadlineAlert } from '../goals/goal-deadline.js';
import { Perfil } from '../generated/prisma/enums.js';
import { SectorRefResponse } from '../sectors/sectors.dto.js';

export class PersonRefResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class DashboardUserResponse {
  @ApiProperty()
  nome!: string;

  @ApiProperty({ enum: Perfil })
  perfil!: Perfil;

  @ApiProperty({ type: SectorRefResponse, nullable: true })
  setor!: SectorRefResponse | null;
}

export class ProjectRefResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  codigo!: string;

  @ApiProperty()
  titulo!: string;

  @ApiProperty()
  instrumentoId!: string;
}

export class PanelSummaryResponse {
  @ApiProperty({ description: 'Metas não concluídas sob a responsabilidade de quem consulta' })
  minhasMetas!: number;

  @ApiProperty({ description: 'Prazo nos próximos 30 dias, sem conclusão' })
  metasVencendo!: number;

  @ApiProperty({ description: 'Prazo passado, sem conclusão' })
  metasVencidas!: number;

  @ApiProperty({ description: 'Metas não concluídas sem responsável' })
  metasSemResponsavel!: number;

  @ApiProperty()
  inscricoesAbertas!: number;

  @ApiProperty({ description: 'Atividades de hoje aos próximos 30 dias' })
  atividadesProximas!: number;
}

export class GoalRefResponse {
  @ApiProperty()
  metaId!: string;

  @ApiProperty()
  ordem!: number;

  @ApiProperty()
  objetivo!: string;

  @ApiProperty({ format: 'date', nullable: true })
  periodoFim!: string | null;

  @ApiProperty({ enum: DEADLINE_ALERTS, nullable: true })
  alerta!: DeadlineAlert | null;

  @ApiProperty({ type: PersonRefResponse, nullable: true })
  responsavel!: PersonRefResponse | null;

  @ApiProperty({ type: ProjectRefResponse })
  projeto!: ProjectRefResponse;
}

export class ActivityRegistrationSummary {
  @ApiProperty()
  aberta!: boolean;

  @ApiProperty()
  vagas!: number;

  @ApiProperty()
  inscritos!: number;

  @ApiProperty({ example: '/inscrever/AbCdEfGhIjKlMnOp' })
  linkPublico!: string;
}

export class UpcomingActivityResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  titulo!: string;

  @ApiProperty({ format: 'date' })
  data!: string;

  @ApiProperty()
  local!: string;

  @ApiProperty({ type: ProjectRefResponse })
  projeto!: ProjectRefResponse;

  @ApiProperty({ type: ActivityRegistrationSummary, nullable: true })
  inscricao!: ActivityRegistrationSummary | null;
}

export class InstrumentTermResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  numeroProcesso!: string;

  @ApiProperty()
  orgaoConcedente!: string;

  @ApiProperty({ format: 'date' })
  vigenciaInicio!: string;

  @ApiProperty({ format: 'date' })
  vigenciaFim!: string;
}

export class PanelResponse {
  @ApiProperty({ format: 'date', description: 'Hoje em Brasília, base das contagens' })
  hoje!: string;

  @ApiProperty({ type: PanelSummaryResponse })
  resumo!: PanelSummaryResponse;

  @ApiProperty({ type: [GoalRefResponse], description: 'Vencidas e com prazo em 30 dias, até 6' })
  prazos!: GoalRefResponse[];

  @ApiProperty({ type: [GoalRefResponse], description: 'Sem responsável, até 5' })
  semResponsavel!: GoalRefResponse[];

  @ApiProperty({ type: [UpcomingActivityResponse], description: 'Próximos 30 dias, até 5' })
  proximasAtividades!: UpcomingActivityResponse[];

  @ApiProperty({
    type: [InstrumentTermResponse],
    description: 'Instrumentos ativos, do fim mais próximo, até 4',
  })
  vigencias!: InstrumentTermResponse[];
}

export class AccountsSummaryResponse {
  @ApiProperty()
  ativas!: number;

  @ApiProperty({ description: 'Bloqueadas agora por tentativas de acesso' })
  bloqueadas!: number;

  @ApiProperty({ description: 'Ativas que ainda não trocaram a senha temporária' })
  aguardandoPrimeiroAcesso!: number;
}

export class DashboardResponse {
  @ApiProperty({ type: DashboardUserResponse })
  usuario!: DashboardUserResponse;

  @ApiProperty({
    type: PanelResponse,
    nullable: true,
    description: 'Presidência e Gestão, Núcleo Pedagógico e Administrativo-Financeiro',
  })
  painel!: PanelResponse | null;

  @ApiProperty({
    type: AccountsSummaryResponse,
    nullable: true,
    description: 'Administração do sistema',
  })
  contas!: AccountsSummaryResponse | null;
}
