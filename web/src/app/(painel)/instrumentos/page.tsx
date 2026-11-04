import type { Metadata } from 'next';
import { InstrumentsView } from '@/sections/instrumentos/views/instruments-view';

export const metadata: Metadata = { title: 'Instrumentos | CyberSetor' };

export default function InstrumentsPage() {
  return <InstrumentsView />;
}
