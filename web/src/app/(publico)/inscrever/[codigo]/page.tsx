import type { Metadata } from 'next';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/br';
import { PublicRegistrationView } from '@/sections/inscricao-publica/views/public-registration-view';
import type { PublicForm } from '@/types/inscricao-publica';

const SITE = 'Instituto No Setor';

/** Prévia do link nas redes e no WhatsApp: nome da atividade, data, local e situação. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ codigo: string }>;
}): Promise<Metadata> {
  const { codigo } = await params;
  const base: Metadata = { robots: { index: false, follow: false } };
  try {
    const form = await apiRequest<PublicForm>(
      `/public/registrations/${encodeURIComponent(codigo)}`,
    );
    const { titulo, data, local } = form.atividade;
    const title = `Inscrição: ${titulo} | ${SITE}`;
    const description = `${formatDate(data)} · ${local}. ${
      form.aberta ? 'Inscrições abertas.' : 'Inscrições encerradas.'
    }`;
    return {
      ...base,
      title,
      description,
      openGraph: { title, description, siteName: SITE, locale: 'pt_BR', type: 'website' },
    };
  } catch {
    return { ...base, title: `Inscrição | ${SITE}` };
  }
}

export default async function PublicRegistrationPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  return <PublicRegistrationView codigo={codigo} />;
}
