'use client';

import { cn } from 'cn';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { NAVIGATION, isActiveItem } from '@/auth/profiles';
import { paths } from '@/routes/paths';

export interface Crumb {
  label: string;
  href?: string;
}

const BreadcrumbsContext = createContext<Dispatch<SetStateAction<Crumb[] | null>> | null>(null);
const CrumbsValue = createContext<Crumb[] | null>(null);

export function BreadcrumbsProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[] | null>(null);
  return (
    <BreadcrumbsContext.Provider value={setCrumbs}>
      <CrumbsValue.Provider value={crumbs}>{children}</CrumbsValue.Provider>
    </BreadcrumbsContext.Provider>
  );
}

/**
 * Trilha de uma página de detalhe (instrumento, projeto). As páginas do menu não precisam
 * chamar: a trilha delas sai do próprio menu. `null` enquanto o nome ainda carrega.
 */
export function useBreadcrumbs(crumbs: Crumb[] | null) {
  const setCrumbs = useContext(BreadcrumbsContext);
  const key = JSON.stringify(crumbs);
  useEffect(() => {
    if (!setCrumbs) return;
    setCrumbs(key === 'null' ? null : (JSON.parse(key) as Crumb[]));
    return () => setCrumbs(null);
  }, [key, setCrumbs]);
}

const HOME: Crumb = { label: 'Início', href: paths.dashboard.root };

function fromNavigation(pathname: string): Crumb[] {
  if (pathname === paths.dashboard.root) return [{ label: HOME.label }];
  const item = NAVIGATION.find(
    (entry) => entry.href !== paths.dashboard.root && isActiveItem(pathname, entry.href),
  );
  if (!item) return [];
  return pathname === item.href
    ? [HOME, { label: item.label }]
    : [HOME, { label: item.label, href: item.href }];
}

/** Na barra superior. No celular mostra só o nível anterior e o atual. */
export function HeaderBreadcrumbs() {
  const pathname = usePathname();
  const custom = useContext(CrumbsValue);
  const trail = useMemo(() => custom ?? fromNavigation(pathname), [custom, pathname]);
  if (trail.length === 0) return null;

  return (
    <nav aria-label="Trilha de navegação" className="min-w-0 flex-1">
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          const hiddenOnPhone = index < trail.length - 2;
          return (
            <li
              key={`${index}-${crumb.label}`}
              className={cn(
                'min-w-0 items-center gap-1',
                hiddenOnPhone ? 'hidden sm:flex' : 'flex',
                !last && 'shrink-0',
              )}
            >
              {index > 0 && (
                <ChevronRightIcon
                  aria-hidden="true"
                  className={cn(
                    'size-4 shrink-0 text-muted-foreground',
                    index === trail.length - 2 && 'hidden sm:block',
                  )}
                />
              )}
              {last || !crumb.href ? (
                <span aria-current={last ? 'page' : undefined} className="truncate font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="inline-flex min-h-12 max-w-48 items-center truncate rounded-md px-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span className="truncate">{crumb.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
