import type { Metadata } from 'next';
import { HomeView } from '@/sections/inicio/views/home-view';

export const metadata: Metadata = { title: 'Início | CyberSetor' };

export default function HomePage() {
  return <HomeView />;
}
