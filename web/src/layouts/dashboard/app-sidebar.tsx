'use client';

import { LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/auth/hooks/use-session';
import { navigationFor, profileLabel } from '@/auth/profiles';
import { signOut } from '@/auth/session';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { paths } from '@/routes/paths';

export function AppSidebar() {
  const pathname = usePathname();
  const { session } = useSession();
  const { setOpenMobile } = useSidebar();
  const items = session ? navigationFor(session.perfil) : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href={paths.dashboard.root} onClick={() => setOpenMobile(false)} />}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                CS
              </span>
              <span className="font-semibold">CyberSetor</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Painel</SidebarGroupLabel>
          <nav aria-label="Navegação principal">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={item.label}
                    isActive={pathname === item.href}
                    render={
                      <Link
                        href={item.href}
                        aria-current={pathname === item.href ? 'page' : undefined}
                        onClick={() => setOpenMobile(false)}
                      />
                    }
                  >
                    {item.icon && <item.icon />}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </nav>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {session && (
          <p className="truncate px-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            {profileLabel(session.perfil)}
          </p>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Sair"
              onClick={() => {
                signOut().catch(() => null);
              }}
            >
              <LogOutIcon />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
