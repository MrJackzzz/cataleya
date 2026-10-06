"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { siteConfigSchema } from "@/lib/validations";
import type { FormState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";

export async function upsertSiteConfig(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = siteConfigSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline"),
    whatsapp: formData.get("whatsapp"),
    announcement: formData.get("announcement"),
    announcementEnabled: formData.get("announcementEnabled") === "on",
    catalogEnabled: formData.get("catalogEnabled") === "on",
    showDisclaimer: formData.get("showDisclaimer") === "on",
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
  return { success: "Configuración del sitio actualizada." };
}
