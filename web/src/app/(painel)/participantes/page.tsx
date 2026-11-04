import type { Metadata } from 'next';
import { ParticipantsView } from '@/sections/participantes/views/participants-view';

export const metadata: Metadata = { title: 'Participantes | CyberSetor' };

export default function ParticipantsPage() {
  return <ParticipantsView />;
}
