import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function AdminSettingsPage() {
  const config = await prisma.siteConfig.findUnique({ where: { id: "singleton" } });

  const initial = {
    siteName: config?.siteName ?? "Cataleya Aromas",
    tagline: config?.tagline ?? "Perfumería de autor · Réplicas de alta gama",
    whatsapp: config?.whatsapp ?? "",
    announcement: config?.announcement ?? "",
    announcementEnabled: config?.announcementEnabled ?? false,
    catalogEnabled: config?.catalogEnabled ?? true,
    showDisclaimer: config?.showDisclaimer ?? true,
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-gold">Control del sitio público</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">Configuración</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Administrá la identidad visible del catálogo, el anuncio superior, el
          contacto de WhatsApp y la pausa general del catálogo.
        </p>
      </div>

      <div className="max-w-3xl rounded-xl border border-gold/15 bg-card p-6">
        <SettingsForm initial={initial} />
      </div>
    </div>
  );
}
