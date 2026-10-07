import Link from "next/link";
import { Phone } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/auth";
import { AccessRequestButton } from "@/components/catalog/AccessRequestButton";
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
        <div className="border-b border-gold/10 bg-burgundy-deep/40 px-4 py-2 text-center text-xs tracking-[0.18em] text-gold-soft uppercase">
          {config.announcement}
        </div>
      ) : null}

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex flex-col leading-none">
          <span className="font-display text-3xl tracking-wide text-gradient-gold">
            Cataleya Aromas
          </span>
          <span className="eyebrow mt-1 text-muted-foreground">
            Perfumería de autor
          </span>
        </Link>

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
                <Link href="/login">Iniciar sesión</Link>
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
                <Phone className="size-4 text-gold" />
              </a>
            </Button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
