'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from 'cn';
import type { ComponentProps } from 'react';

function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-6', className)}
      {...props}
    />
  );
}

/**
 * A lista rola de lado no celular, sem quebrar a página (RNF15). A borda direita esmaece
 * enquanto há aba escondida, para indicar que a lista continua.
 */
function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] max-md:pr-8 max-md:[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Quantidade ao lado do nome da aba; some enquanto carrega. Fica fora do nome acessível da aba
 * (o painel já diz quantos itens mostra) e vai no título, para quem passa o cursor.
 */
function TabsCount({ value, label }: { value: number | undefined; label: string }) {
  if (value === undefined) return null;
  return (
    <span
      data-slot="tabs-count"
      aria-hidden="true"
      title={`${value} ${label}`}
      className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground tabular-nums"
    >
      {value}
    </span>
  );
}

function TabsTab({ className, ...props }: ComponentProps<typeof TabsPrimitive.Tab>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        'min-h-12 shrink-0 cursor-pointer border-b-2 border-transparent px-4 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[active]:border-primary data-[active]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function TabsPanel({ className, ...props }: ComponentProps<typeof TabsPrimitive.Panel>) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn('flex flex-col gap-6 outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsCount, TabsList, TabsPanel, TabsTab };
