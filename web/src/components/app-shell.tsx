'use client';

import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export const NAV_ITEMS = [{ href: '/', label: 'Início' }] as const;

function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Navegação principal" className={className}>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-4">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu" />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left" className="p-4">
              <SheetTitle>CyberSetor</SheetTitle>
              <Separator />
              <NavLinks className="flex flex-col gap-1" onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-semibold">
            CyberSetor
          </Link>
          <NavLinks className="hidden items-center gap-1 md:flex" />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
