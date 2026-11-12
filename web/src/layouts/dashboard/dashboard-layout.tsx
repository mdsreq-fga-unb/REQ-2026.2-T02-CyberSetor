'use client';

import type { ReactNode } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccountMenu } from './account-menu';
import { AppSidebar } from './app-sidebar';
import { BreadcrumbsProvider, HeaderBreadcrumbs } from './breadcrumbs';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <BreadcrumbsProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background px-2 md:px-4">
              <SidebarTrigger />
              <HeaderBreadcrumbs />
              <div className="ml-auto shrink-0">
                <AccountMenu />
              </div>
            </header>
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-6">
              {children}
            </div>
          </SidebarInset>
        </BreadcrumbsProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}
