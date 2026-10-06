"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { sampleDeliverySchema, sampleStatusSchema } from "@/lib/validations";
import type { FormState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";

export async function createSampleDelivery(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = sampleDeliverySchema.safeParse({
    userId: formData.get("userId"),
    productCode: formData.get("productCode"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  await prisma.sampleDelivery.create({
    data: {
      userId: parsed.data.userId,
      productCode: parsed.data.productCode,
      quantity: parsed.data.quantity,
    },
  });

  revalidatePath("/", "layout");
  return { success: "Muestra registrada." };
}

export async function setSampleStatus(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = sampleStatusSchema.safeParse({
    sampleId: formData.get("sampleId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  await prisma.sampleDelivery.update({
    where: { id: parsed.data.sampleId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/", "layout");
  return { success: "Estado de muestra actualizado." };
}
