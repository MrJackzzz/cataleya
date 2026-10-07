import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { priceForRole } from "@/lib/pricing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DisclaimerBanner } from "@/components/catalog/DisclaimerBanner";
import { AccessRequestButton } from "@/components/catalog/AccessRequestButton";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ORDERABLE_ROLES = ["CLIENTE", "SOCIO", "FAMILIAR"];

export default async function HomePage() {
  const [session, config, products, markups] = await Promise.all([
    auth(),
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { codeNumber: "asc" },
    }),
    prisma.roleMarkup.findMany(),
  ]);

  const role = session?.user?.role ? String(session.user.role) : null;
  const canOrder = Boolean(role && ORDERABLE_ROLES.includes(role));
  const isPending = role === "PENDIENTE";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-gold/15">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(126,31,51,0.35),transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
            <p className="eyebrow text-gold">Contratipos de alta gama</p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-ivory sm:text-7xl">
              Los grandes clásicos, <span className="text-gradient-gold">reinterpretados</span> en tu piel.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Réplicas de alta calidad con numeración olfativa propia. Elegí tu
              fragancia, consultá tu precio según tu membresía y generá tu pedido
              directo desde el catálogo.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href="#perfumes">Ver catálogo</Link>
              </Button>
              {!canOrder && !isPending ? (
                <AccessRequestButton variant="outline" />
              ) : null}
              {canOrder ? (
                <Button asChild variant="outline">
                  <Link href="/mi-cuenta">Mi cuenta</Link>
                </Button>
              ) : null}
            </div>

            {config?.showDisclaimer !== false ? (
              <div className="mt-10 max-w-3xl">
                <DisclaimerBanner />
              </div>
            ) : null}
          </div>
        </section>

        <section id="perfumes" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-gold">Catálogo</p>
              <h2 className="mt-2 font-display text-4xl text-ivory sm:text-5xl">
                Fragancias disponibles
              </h2>
            </div>
            {session?.user ? (
              <p className="hidden text-sm text-muted-foreground sm:block">
                Hola, <span className="text-gold-soft">{session.user.name}</span>
              </p>
            ) : null}
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border border-gold/20 bg-card px-6 py-16 text-center">
              <p className="font-display text-3xl text-ivory">
                El catálogo está siendo preparado
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Muy pronto vas a poder ver las fragancias disponibles.
              </p>
            </div>
          ) : (
            <CatalogGrid
              items={products.map((product) => ({
                product,
                displayPrice: canOrder
                  ? priceForRole(product.baseCostPrice, markups, role!)
                  : null,
              }))}
              canOrder={canOrder}
              isPending={isPending}
            />
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
