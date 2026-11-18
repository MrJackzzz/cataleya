"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { siteConfigSchema } from "@/lib/validations";
import { uploadImageToR2 } from "@/lib/r2";
import type { FormState } from "@/lib/action-state";
import { logMovement } from "@/lib/movements";
import { revalidatePath } from "next/cache";

export async function upsertSiteConfig(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  let logoUrl = String(formData.get("logoUrl") ?? "");
  const logoFile = formData.get("logoFile");

  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      logoUrl = await uploadImageToR2(logoFile);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "No se pudo subir el logo.",
      };
    }
  }

  let replicaBottleUrl = String(formData.get("replicaBottleUrl") ?? "");
  const replicaBottleFile = formData.get("replicaBottleFile");
  if (replicaBottleFile instanceof File && replicaBottleFile.size > 0) {
    try {
      replicaBottleUrl = await uploadImageToR2(replicaBottleFile);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "No se pudo subir la imagen de envase réplica." };
    }
  }

  let sampleBottleUrl = String(formData.get("sampleBottleUrl") ?? "");
  const sampleBottleFile = formData.get("sampleBottleFile");
  if (sampleBottleFile instanceof File && sampleBottleFile.size > 0) {
    try {
      sampleBottleUrl = await uploadImageToR2(sampleBottleFile);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "No se pudo subir la imagen de envase muestra." };
    }
  }

  const parsed = siteConfigSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    whatsapp: formData.get("whatsapp"),
    announcement: formData.get("announcement"),
    announcementEnabled: formData.get("announcementEnabled") === "on",
    catalogEnabled: formData.get("catalogEnabled") === "on",
    showDisclaimer: formData.get("showDisclaimer") === "on",
    logoUrl,
    replicaBottleUrl,
    sampleBottleUrl,
    cardSize: formData.get("cardSize") ?? "normal",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá la configuración." };
  }

  await prisma.siteConfig.upsert({
    where: { id: "singleton" },
    update: parsed.data,
    create: { id: "singleton", ...parsed.data },
  });

  revalidatePath("/", "layout");
  await logMovement("CONFIG", "Configuración del sitio actualizada.");
  return { success: "Configuración del sitio actualizada." };
}
