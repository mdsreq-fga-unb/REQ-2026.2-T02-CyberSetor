import type { Metadata } from 'next';
import { ProjectGoalsView } from '@/sections/metas/views/project-goals-view';

export const metadata: Metadata = { title: 'Metas do projeto | CyberSetor' };

export default async function ProjectGoalsPage({
  params,
}: {
  params: Promise<{ id: string; projetoId: string }>;
}) {
  const { id, projetoId } = await params;
  return <ProjectGoalsView instrumentId={id} projectId={projetoId} />;
}
