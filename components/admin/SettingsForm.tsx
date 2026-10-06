"use client";

import { useActionState, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { upsertSiteConfig } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export type SiteConfigValues = {
  siteName: string;
  tagline: string;
  whatsapp: string;
  announcement: string;
  announcementEnabled: boolean;
  catalogEnabled: boolean;
  showDisclaimer: boolean;
};

export function SettingsForm({ initial }: { initial: SiteConfigValues }) {
  const [state, formAction, pending] = useActionState(upsertSiteConfig, null);
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    initial.announcementEnabled
  );
  const [catalogEnabled, setCatalogEnabled] = useState(initial.catalogEnabled);
  const [showDisclaimer, setShowDisclaimer] = useState(initial.showDisclaimer);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="site-name">Nombre del sitio</Label>
          <Input id="site-name" name="siteName" defaultValue={initial.siteName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="site-whatsapp">WhatsApp (con código de país, solo dígitos)</Label>
          <Input
            id="site-whatsapp"
            name="whatsapp"
            defaultValue={initial.whatsapp}
            placeholder="5491123456789"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="site-tagline">Bajada / tagline</Label>
        <Input id="site-tagline" name="tagline" defaultValue={initial.tagline} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="site-announcement">Anuncio superior (banner)</Label>
        <Textarea
          id="site-announcement"
          name="announcement"
          rows={2}
          defaultValue={initial.announcement}
          placeholder="Ej.: Envíos a todo el país · Nueva línea amaderada disponible"
        />
      </div>

      <div className="space-y-4 rounded-xl border border-gold/15 bg-background/40 p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ivory">Mostrar anuncio</p>
            <p className="text-xs text-muted-foreground">
              Muestra el banner en la cabecera del sitio.
            </p>
          </div>
          <input
            type="hidden"
            name="announcementEnabled"
            value={announcementEnabled ? "on" : ""}
          />
          <Switch
            checked={announcementEnabled}
            onCheckedChange={setAnnouncementEnabled}
            aria-label="Mostrar anuncio"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ivory">Catálogo activo</p>
            <p className="text-xs text-muted-foreground">
              Desactivalo para pausar la vista pública del catálogo.
            </p>
          </div>
          <input
            type="hidden"
            name="catalogEnabled"
            value={catalogEnabled ? "on" : ""}
          />
          <Switch
            checked={catalogEnabled}
            onCheckedChange={setCatalogEnabled}
            aria-label="Catálogo activo"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ivory">Mostrar disclaimer olfativo</p>
            <p className="text-xs text-muted-foreground">
              Aviso legal obligatorio en portada y pie.
            </p>
          </div>
          <input type="hidden" name="showDisclaimer" value={showDisclaimer ? "on" : ""} />
          <Switch
            checked={showDisclaimer}
            onCheckedChange={setShowDisclaimer}
            aria-label="Mostrar disclaimer"
          />
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-emerald-300">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {pending ? "Guardando…" : "Guardar configuración"}
      </Button>
    </form>
  );
}
