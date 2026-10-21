import { ApiStatus } from '@/components/api-status';
import { PageHeader } from '@/components/page-header';

export function HomeView() {
  return (
    <>
      <PageHeader
        title="CyberSetor"
        description="Gestão do ciclo de projetos financiados do Instituto Cultural e Social No Setor."
      />
      <ApiStatus />
    </>
  );
}
