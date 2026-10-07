"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Store, Menu, X, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { LINKS } from "@/components/admin/AdminSidebar";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-gold/15 bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú del panel"
          className="flex size-9 items-center justify-center rounded-lg border border-gold/25 text-gold transition-colors hover:bg-gold/10"
        >
          <Menu className="size-5" />
        </button>
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

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute top-0 left-0 flex h-full w-72 flex-col border-r border-gold/20 bg-sidebar">
            <div className="flex items-center justify-between border-b border-gold/15 px-5 py-4">
              <span className="font-display text-2xl leading-none text-gradient-gold">
                Cataleya
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú del panel"
                className="flex size-9 items-center justify-center rounded-lg border border-gold/25 text-gold transition-colors hover:bg-gold/10"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
              {LINKS.map((link) => {
                const active =
                  link.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(link.href);
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "border border-gold/30 bg-burgundy-deep/50 text-gold-soft"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-ivory"
                    }`}
                  >
                    <Icon className="size-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-gold/15 p-3">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-ivory"
                >
                  <LogOut className="size-4" /> Cerrar sesión
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
