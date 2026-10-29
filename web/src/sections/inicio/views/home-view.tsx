'use client';

import Link from 'next/link';
import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CalendarDaysIcon,
  KeyRoundIcon,
  LockIcon,
  TargetIcon,
  UsersIcon,
} from 'lucide-react';
import { ApiStatus } from '@/components/api-status';
import { ListError } from '@/components/list/list-states';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { profileLabel } from '@/auth/profiles';
import { useDashboard } from '@/queries/painel';
import { paths } from '@/routes/paths';
import type { Dashboard, Panel } from '@/types/painel';
import {
  DeadlineList,
  OpenRegistrations,
  PanelCard,
  SummaryWidget,
  TermList,
  UnownedGoalList,
  UpcomingActivityList,
  WelcomeCard,
} from '../home-widgets';

function count(value: number, one: string, many: string): string {
  return `${value} ${value === 1 ? one : many}`;
}

/** O resumo do dia em uma frase, pelo que pede atenção primeiro. */
export function panelSummary(panel: Panel): string {
  const { metasVencidas, metasVencendo, minhasMetas } = panel.resumo;
  if (metasVencidas === 0 && metasVencendo === 0) {
    return 'Nenhuma meta vencida ou com prazo nos próximos 30 dias. Os prazos estão em dia.';
  }
  const parts = [
    metasVencidas > 0 && count(metasVencidas, 'meta vencida', 'metas vencidas'),
    metasVencendo > 0 && `${count(metasVencendo, 'meta', 'metas')} com prazo nos próximos 30 dias`,
  ].filter(Boolean);
  const mine = minhasMetas > 0 ? ` Você responde por ${count(minhasMetas, 'meta', 'metas')}.` : '';
  return `Há ${parts.join(' e ')}.${mine}`;
}

function firstName(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

function subtitleOf(dashboard: Dashboard): string {
  const { perfil, setor } = dashboard.usuario;
  return setor ? `${profileLabel(perfil)} · ${setor.nome}` : profileLabel(perfil);
}

function PanelHome({ dashboard, panel }: { dashboard: Dashboard; panel: Panel }) {
  const { resumo } = panel;
  const open = panel.proximasAtividades.filter((activity) => activity.inscricao?.aberta);
  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-8">
        <WelcomeCard
          name={firstName(dashboard.usuario.nome)}
          subtitle={subtitleOf(dashboard)}
          summary={panelSummary(panel)}
          action={
            <Link
              href={paths.dashboard.instruments}
              className={buttonVariants({ variant: 'secondary' })}
            >
              Ver instrumentos e projetos
            </Link>
          }
        />
      </div>
      <div className="lg:col-span-4">
        <OpenRegistrations activities={open} total={resumo.inscricoesAbertas} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:col-span-12 lg:grid-cols-4 lg:gap-6">
        <SummaryWidget
          title="Minhas metas"
          value={resumo.minhasMetas}
          caption="Sob a sua responsabilidade, não concluídas"
          icon={TargetIcon}
          tone="primary"
        />
        <SummaryWidget
          title="Prazo em até 30 dias"
          value={resumo.metasVencendo}
          caption="Metas ainda não concluídas"
          icon={CalendarClockIcon}
          tone="warning"
        />
        <SummaryWidget
          title="Metas vencidas"
          value={resumo.metasVencidas}
          caption="Prazo passou sem conclusão"
          icon={AlertTriangleIcon}
          tone="destructive"
        />
        <SummaryWidget
          title="Atividades em 30 dias"
          value={resumo.atividadesProximas}
          caption={count(resumo.inscricoesAbertas, 'inscrição aberta', 'inscrições abertas')}
          icon={CalendarDaysIcon}
          tone="success"
        />
      </div>

      <PanelCard
        id="prazos"
        title="Prazos das metas"
        description="Vencidas e com prazo nos próximos 30 dias"
        empty={panel.prazos.length === 0 ? 'Nenhuma pendência de prazo.' : null}
        className="lg:col-span-8"
      >
        <DeadlineList goals={panel.prazos} hoje={panel.hoje} />
      </PanelCard>
      <PanelCard
        id="vigencias"
        title="Vigência dos instrumentos"
        description="Instrumentos ativos, do fim mais próximo"
        empty={panel.vigencias.length === 0 ? 'Nenhum instrumento ativo.' : null}
        className="lg:col-span-4"
      >
        <TermList terms={panel.vigencias} hoje={panel.hoje} />
      </PanelCard>

      <PanelCard
        id="proximas-atividades"
        title="Próximas atividades"
        description="Nos próximos 30 dias, com a inscrição"
        empty={
          panel.proximasAtividades.length === 0
            ? 'Nenhuma atividade marcada para os próximos 30 dias.'
            : null
        }
        className="lg:col-span-8"
      >
        <UpcomingActivityList activities={panel.proximasAtividades} />
      </PanelCard>
      <PanelCard
        id="sem-responsavel"
        title="Metas sem responsável"
        description={
          resumo.metasSemResponsavel > panel.semResponsavel.length
            ? `${panel.semResponsavel.length} de ${resumo.metasSemResponsavel}`
            : undefined
        }
        empty={panel.semResponsavel.length === 0 ? 'Todas as metas têm responsável.' : null}
        className="lg:col-span-4"
      >
        <UnownedGoalList goals={panel.semResponsavel} />
      </PanelCard>
    </div>
  );
}

function AdminHome({ dashboard }: { dashboard: Dashboard }) {
  const contas = dashboard.contas!;
  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-12">
        <WelcomeCard
          name={firstName(dashboard.usuario.nome)}
          subtitle={subtitleOf(dashboard)}
          summary="Contas da equipe do Instituto e situação do sistema."
          action={
            <Link
              href={paths.dashboard.accounts}
              className={buttonVariants({ variant: 'secondary' })}
            >
              Gerenciar contas
            </Link>
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-12 lg:gap-6">
        <SummaryWidget
          title="Contas ativas"
          value={contas.ativas}
          caption="Pessoas da equipe com acesso"
          icon={UsersIcon}
          tone="primary"
        />
        <SummaryWidget
          title="Aguardando o primeiro acesso"
          value={contas.aguardandoPrimeiroAcesso}
          caption="Ainda com a senha temporária"
          icon={KeyRoundIcon}
          tone="warning"
        />
        <SummaryWidget
          title="Bloqueadas agora"
          value={contas.bloqueadas}
          caption="Por tentativas de acesso erradas"
          icon={LockIcon}
          tone="destructive"
        />
      </div>
      <PanelCard id="sistema" title="Situação do sistema" className="lg:col-span-12">
        <ApiStatus />
      </PanelCard>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando o painel"
      className="grid gap-4 lg:grid-cols-12 lg:gap-6"
    >
      <Skeleton className="h-48 lg:col-span-8" />
      <Skeleton className="h-48 lg:col-span-4" />
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-28 lg:col-span-3" />
      ))}
      <Skeleton className="h-64 lg:col-span-8" />
      <Skeleton className="h-64 lg:col-span-4" />
    </div>
  );
}

export function HomeView() {
  const dashboard = useDashboard();

  if (dashboard.isPending) return <HomeSkeleton />;
  if (dashboard.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <ListError message="Não foi possível carregar o painel." />
        <Button variant="outline" onClick={() => void dashboard.refetch()}>
          Tentar de novo
        </Button>
      </div>
    );
  }

  const data = dashboard.data;
  if (data.painel) return <PanelHome dashboard={data} panel={data.painel} />;
  if (data.contas) return <AdminHome dashboard={data} />;
  return (
    <WelcomeCard
      name={firstName(data.usuario.nome)}
      subtitle={subtitleOf(data)}
      summary="O acesso do órgão concedente é de consulta à prestação de contas. Os relatórios aparecem aqui quando forem publicados."
    />
  );
}
