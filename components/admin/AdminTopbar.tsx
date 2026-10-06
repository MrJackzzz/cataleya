"use client";

import Link from "next/link";
import { Bell, Store, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AdminAlerts = {
  pendingUsers: number;
  newOrders: number;
  recentLogins: {
    id: string;
    name: string;
    lastName: string;
    at: string;
  }[];
};

export function AdminTopbar({ alerts }: { alerts: AdminAlerts }) {
  const total = alerts.pendingUsers + alerts.newOrders;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gold/15 bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <Menu className="size-5 text-gold" />
        <span className="font-display text-xl text-gradient-gold">Cataleya</span>
      </div>

      <p className="hidden text-sm text-muted-foreground md:block">
        Actividad en tiempo real del catálogo y los pedidos.
      </p>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="size-4 text-gold" />
              <span className="eyebrow ml-1 hidden sm:inline">Alertas</span>
              {total > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {total > 9 ? "9+" : total}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 border-gold/25">
            <DropdownMenuLabel className="eyebrow text-gold">
              Notificaciones
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/usuarios" className="flex w-full cursor-pointer justify-between">
                Usuarios pendientes de aprobación
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {alerts.pendingUsers}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/pedidos" className="flex w-full cursor-pointer justify-between">
                Nuevos pedidos (24h)
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {alerts.newOrders}
                </span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Logins recientes
            </DropdownMenuLabel>
            {alerts.recentLogins.length === 0 ? (
              <DropdownMenuItem disabled>Sin logins en las últimas 24h</DropdownMenuItem>
            ) : (
              alerts.recentLogins.map((login) => (
                <DropdownMenuItem key={login.id} className="flex flex-col items-start gap-0.5">
                  <span className="text-sm text-ivory">
                    {login.name} {login.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">{login.at}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button asChild variant="ghost" size="sm">
          <Link href="/" target="_blank">
            <Store className="size-4" />
            <span className="hidden sm:inline">Ver sitio</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
