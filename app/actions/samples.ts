"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { logMovement } from "@/lib/movements";
import {
  sampleDeliverySchema,
  sampleStatusSchema,
  sampleReturnSchema,
} from "@/lib/validations";
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
    include: { user: { select: { name: true, lastName: true } } },
  }).then((sample) =>
    logMovement(
      "MUESTRA",
      `Muestra N° ${sample.productCode} x${sample.quantity} para ${sample.user.name} ${sample.user.lastName}.`
    )
  );

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

  const updated = await prisma.sampleDelivery.update({
    where: { id: parsed.data.sampleId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/", "layout");
  await logMovement("MUESTRA", `Muestra N° ${updated.productCode} → ${parsed.data.status}.`);
  return { success: "Estado de muestra actualizado." };
}

export async function registerSampleReturn(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = sampleReturnSchema.safeParse({
    sampleId: formData.get("sampleId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá la cantidad." };
  }

  const sample = await prisma.sampleDelivery.findUnique({
    where: { id: parsed.data.sampleId },
  });
  if (!sample) return { error: "Muestra no encontrada." };

  const outstanding = sample.quantity - sample.returned;
  if (parsed.data.quantity > outstanding) {
    return {
      error:
        outstanding <= 0
          ? "Ya se devolvió todo."
          : `Solo quedan ${outstanding} sin devolver.`,
    };
  }

  const returned = sample.returned + parsed.data.quantity;

  await prisma.sampleDelivery.update({
    where: { id: sample.id },
    data: {
      returned,
      ...(returned >= sample.quantity ? { status: "CERRADO" } : {}),
    },
  });

  revalidatePath("/", "layout");
  await logMovement(
    "MUESTRA",
    `Devolución muestra N° ${sample.productCode} x${parsed.data.quantity} (${returned} de ${sample.quantity}).`
  );
  return {
    success:
      returned >= sample.quantity
        ? "Devolución completa. Muestra cerrada."
        : `Devolución registrada (${returned} de ${sample.quantity}).`,
  };
}
