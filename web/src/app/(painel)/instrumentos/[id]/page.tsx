import type { Metadata } from 'next';
import { InstrumentProjectsView } from '@/sections/projetos/views/instrument-projects-view';

export const metadata: Metadata = { title: 'Projetos do instrumento | CyberSetor' };

export default async function InstrumentProjectsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InstrumentProjectsView instrumentId={id} />;
}
