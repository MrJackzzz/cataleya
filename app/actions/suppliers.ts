"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guards";
import { supplierSchema, purchaseSchema } from "@/lib/validations";
import type { FormState } from "@/lib/action-state";
import { revalidatePath } from "next/cache";

export async function createSupplier(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  await prisma.supplier.create({
    data: {
      name: parsed.data.name,
      contact: parsed.data.contact || null,
    },
  });

  revalidatePath("/admin/proveedores");
  return { success: "Proveedor registrado." };
}

export async function createPurchase(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = purchaseSchema.safeParse({
    supplierId: formData.get("supplierId"),
    item: formData.get("item"),
    cost: formData.get("cost"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  await prisma.supplierPurchase.create({
    data: {
      supplierId: parsed.data.supplierId,
      item: parsed.data.item,
      cost: parsed.data.cost,
      date: new Date(parsed.data.date),
    },
  });

  revalidatePath("/admin/proveedores");
  return { success: "Compra registrada." };
}

export async function deletePurchase(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.supplierPurchase.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/admin/proveedores");
}

export async function deleteSupplier(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.supplier.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/admin/proveedores");
}
