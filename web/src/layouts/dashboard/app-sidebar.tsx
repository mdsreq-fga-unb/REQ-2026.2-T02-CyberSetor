'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/auth/hooks/use-session';
import { isActiveItem, navigationFor } from '@/auth/profiles';
import { LogoMark } from '@/components/brand/logo-mark';
import {
  Sidebar,
  SidebarContent,
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
              <LogoMark className="size-8! rounded-md" />
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
                    isActive={isActiveItem(pathname, item.href)}
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
    </Sidebar>
  );
}
