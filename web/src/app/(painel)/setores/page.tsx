import type { Metadata } from 'next';
import { SectorsView } from '@/sections/setores/views/sectors-view';

export const metadata: Metadata = { title: 'Setores | CyberSetor' };

export default function SectorsPage() {
  return <SectorsView />;
}
