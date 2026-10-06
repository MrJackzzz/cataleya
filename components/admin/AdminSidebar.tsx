"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  ShoppingBag,
  Truck,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/productos", label: "Productos", icon: FlaskConical },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/proveedores", label: "Proveedores", icon: Truck },
  { href: "/admin/ganancias", label: "Ganancias", icon: ChartNoAxesCombined },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gold/15 bg-sidebar md:flex">
      <div className="border-b border-gold/15 px-5 py-5">
        <Link href="/" className="block">
          <span className="font-display text-2xl leading-none text-gradient-gold">
            Cataleya
          </span>
          <span className="eyebrow mt-1 block text-muted-foreground">
            Panel admin
          </span>
        </Link>
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
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
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

      <div className="space-y-2 border-t border-gold/15 p-3">
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/" target="_blank">
            <Store className="size-4" /> Ver sitio
          </Link>
        </Button>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
          >
            <LogOut className="size-4" /> Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
