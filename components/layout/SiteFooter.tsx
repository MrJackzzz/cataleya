import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DISCLAIMER_TEXT } from "@/components/catalog/DisclaimerBanner";

export async function SiteFooter() {
  const config = await prisma.siteConfig.findUnique({
    where: { id: "singleton" },
  });

  return (
    <footer className="mt-16 border-t border-charcoal bg-charcoal text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-cream">Cataleya Aromas</p>
          <p className="mt-2 text-sm text-clay">{config?.tagline}</p>
        </div>

        <div className="text-sm text-clay">
          <p className="eyebrow mb-2 text-gold">Aviso legal</p>
          <p className="leading-relaxed">{DISCLAIMER_TEXT}</p>
        </div>

        <div className="space-y-2 text-sm text-clay">
          <p className="eyebrow mb-2 text-gold">Accesos</p>
          <p>
            <Link href="/login" className="transition-colors hover:text-cream">
              Iniciar sesión
            </Link>
          </p>
          <p>
            <Link href="/mi-cuenta" className="transition-colors hover:text-cream">
              Mi cuenta
            </Link>
          </p>
          {config?.whatsapp ? (
            <a
              href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cream"
            >
              Contacto WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-clay">
        © {new Date().getFullYear()} Cataleya Aromas · Todos los derechos reservados
      </div>
    </footer>
  );
}
