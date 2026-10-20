import { ApiStatus } from '@/components/api-status';

export function HomeView() {
  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">CyberSetor</h1>
        <p className="text-muted-foreground">
          Gestão do ciclo de projetos financiados do Instituto Cultural e Social No Setor.
        </p>
      </div>
      <ApiStatus />
    </>
  );
}
