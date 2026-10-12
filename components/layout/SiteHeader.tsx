import Link from "next/link";
import { Phone, KeyRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/auth";
import { AccessRequestButton } from "@/components/catalog/AccessRequestButton";
import { BrandLockup } from "@/components/layout/BrandLockup";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const [session, config] = await Promise.all([
    auth(),
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
  ]);

  const role = session?.user?.role ? String(session.user.role) : null;
  const isLoggedIn = Boolean(session && role && role !== "PENDIENTE");
  const isAdmin = role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-background/85 backdrop-blur">
      {config?.announcementEnabled && config.announcement ? (
        <div className="border-b border-plum/15 bg-plum/10 px-4 py-2 text-center text-xs tracking-[0.18em] text-plum uppercase">
          {config.announcement}
        </div>
      ) : null}

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <BrandLockup
          titleClassName="font-display text-2xl tracking-wide sm:text-3xl"
          logoUrl={config?.logoUrl}
        />

        <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/#perfumes"
            className="hidden px-2 text-sm text-muted-foreground transition-colors hover:text-gold-soft sm:block"
          >
            Catálogo
          </Link>

          {isAdmin ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">Panel</Link>
            </Button>
          ) : isLoggedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/mi-cuenta">Mi cuenta</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Salir
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <KeyRound className="size-4" />
                  Iniciar sesión
                </Link>
              </Button>
              <AccessRequestButton
                label="Solicitar acceso"
                variant="outline"
              />
            </>
          )}

          {config?.whatsapp ? (
            <Button asChild variant="ghost" size="icon-sm">
              <a
                href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
              >
                <Phone className="size-4 text-gold-deep" />
              </a>
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
