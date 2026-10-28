import type { Metadata } from 'next';
import { PublicRegistrationView } from '@/sections/inscricao-publica/views/public-registration-view';

export const metadata: Metadata = { title: 'Inscrição | Instituto No Setor' };

export default async function PublicRegistrationPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <PublicRegistrationView codigo={codigo} />;
}
