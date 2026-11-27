import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { UnsupportedBrowserNotice } from '@/components/unsupported-browser-notice';
import { BROWSER_SUPPORT_SCRIPT, BROWSER_SUPPORT_STYLE } from '@/lib/browser-support';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CyberSetor',
  description: 'Gestão do ciclo de projetos financiados do Instituto Cultural e Social No Setor',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // suppressHydrationWarning: o script de conferência pode marcar o <html> antes do React.
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BROWSER_SUPPORT_SCRIPT }} />
        <style dangerouslySetInnerHTML={{ __html: BROWSER_SUPPORT_STYLE }} />
      </head>
      <body className="flex min-h-full flex-col">
        <UnsupportedBrowserNotice />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
