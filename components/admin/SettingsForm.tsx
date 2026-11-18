"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Save } from "lucide-react";
import { upsertSiteConfig } from "@/app/actions/settings";
import { DEFAULT_LOGO } from "@/lib/constants";
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
  logoUrl: string;
  replicaBottleUrl: string;
  sampleBottleUrl: string;
};

export function SettingsForm({ initial }: { initial: SiteConfigValues }) {
  const [state, formAction, pending] = useActionState(upsertSiteConfig, null);
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    initial.announcementEnabled
  );
  const [catalogEnabled, setCatalogEnabled] = useState(initial.catalogEnabled);
  const [showDisclaimer, setShowDisclaimer] = useState(initial.showDisclaimer);
  const [logoPreview, setLogoPreview] = useState(initial.logoUrl || DEFAULT_LOGO);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const [replicaBottlePreview, setReplicaBottlePreview] = useState(initial.replicaBottleUrl || "");
  const replicaBottleFileRef = useRef<HTMLInputElement>(null);
  const [sampleBottlePreview, setSampleBottlePreview] = useState(initial.sampleBottleUrl || "");
  const sampleBottleFileRef = useRef<HTMLInputElement>(null);

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
        <Label htmlFor="site-logo">Logo de la marca (header, portada y pestaña)</Label>
        <input type="hidden" name="logoUrl" value={logoPreview} />
        <div className="flex flex-wrap items-center gap-4">
          <Image
            src={logoPreview || DEFAULT_LOGO}
            alt="Vista previa del logo"
            width={64}
            height={64}
            unoptimized
            className="size-16 rounded-full border border-gold/25 bg-card object-contain"
          />
          <div className="min-w-52 flex-1 space-y-2">
            <Input
              id="site-logo"
              ref={logoFileRef}
              name="logoFile"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setLogoPreview(URL.createObjectURL(file));
              }}
            />
            <p className="text-xs text-muted-foreground">
              PNG con fondo transparente o SVG. Si lo dejás vacío se usa el
              emblema original.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (logoFileRef.current) logoFileRef.current.value = "";
              setLogoPreview("");
            }}
          >
            Restablecer emblema
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 rounded-xl border border-gold/15 bg-background/25 p-4">
        <div className="space-y-2">
          <Label htmlFor="site-replica-bottle">Envase general Réplica (60 ml)</Label>
          <input type="hidden" name="replicaBottleUrl" value={replicaBottlePreview} />
          <div className="flex items-center gap-3">
            <div className="relative size-16 overflow-hidden rounded-lg border border-gold/25 bg-card shrink-0">
              {replicaBottlePreview ? (
                <Image
                  src={replicaBottlePreview}
                  alt="Envase réplica"
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground text-center p-1">
                  Sin foto
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Input
                id="site-replica-bottle"
                ref={replicaBottleFileRef}
                name="replicaBottleFile"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setReplicaBottlePreview(URL.createObjectURL(file));
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Imagen de envase real para réplicas (60 ml).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="site-sample-bottle">Envase general Muestra (5 ml)</Label>
          <input type="hidden" name="sampleBottleUrl" value={sampleBottlePreview} />
          <div className="flex items-center gap-3">
            <div className="relative size-16 overflow-hidden rounded-lg border border-gold/25 bg-card shrink-0">
              {sampleBottlePreview ? (
                <Image
                  src={sampleBottlePreview}
                  alt="Envase muestra"
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground text-center p-1">
                  Sin foto
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <Input
                id="site-sample-bottle"
                ref={sampleBottleFileRef}
                name="sampleBottleFile"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setSampleBottlePreview(URL.createObjectURL(file));
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Imagen de envase real para muestras (5 ml).
              </p>
            </div>
          </div>
        </div>
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
        <p className="text-sm text-leaf">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
        {pending ? "Guardando…" : "Guardar configuración"}
      </Button>
    </form>  );
}
