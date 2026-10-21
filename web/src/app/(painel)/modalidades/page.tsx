import type { Metadata } from 'next';
import { ModalitiesView } from '@/sections/modalidades/views/modalities-view';

export const metadata: Metadata = { title: 'Modalidades | CyberSetor' };

export default function ModalitiesPage() {
  return <ModalitiesView />;
}
